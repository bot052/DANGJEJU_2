export default async function handler(req, res) {
  try {
    // Vercel 환경 변수에서 공공데이터 API 키 취득 (절대 노출 금지)
    const serviceKey = process.env.TOUR_API_KEY;

    if (!serviceKey) {
      return res.status(500).json({
        error: "TOUR_API_KEY가 설정되어 있지 않습니다.",
      });
    }

    // 쿼리 파라미터 처리 (페이지 번호, 행 수, 콘텐츠 타입 등)
    const { 
      pageNo = "1", 
      numOfRows = "100", 
      contentTypeId 
    } = req.query;

    // 한국관광공사 TourAPI 4.0 반려동물 동반 여행 동기화 목록 API (petTourSyncList2)
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      MobileOS: "WEB",
      MobileApp: "DANGJeju",
      _type: "json",
      pageNo: String(pageNo),
      numOfRows: String(numOfRows),
      areaCode: "39", // 제주특별자치도 지역코드
    });

    if (contentTypeId) {
      params.append("contentTypeId", String(contentTypeId));
    }

    const url = `https://apis.data.go.kr/B551011/KorService2/petTourSyncList2?${params.toString()}`;

    const response = await fetch(url);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "공공데이터 응답을 JSON으로 파싱하지 못했습니다.",
      });
    }

    // API 응답 헤더 에러 체크
    const header = data?.response?.header;
    if (header && header.resultCode && header.resultCode !== "0000") {
      return res.status(502).json({
        error: `공공데이터 API 오류: ${header.resultMsg || "비정상 응답"}`,
        resultCode: header.resultCode,
      });
    }

    // 목록 데이터 추출 (단일 객체/배열/빈값 안전 처리)
    let rawItems = [];
    const itemsObj = data?.response?.body?.items;
    if (itemsObj && itemsObj.item) {
      rawItems = Array.isArray(itemsObj.item) ? itemsObj.item : [itemsObj.item];
    }

    // 제주특별자치도 (areacode === "39") 데이터만 엄격하게 필터링
    const jejuItems = rawItems.filter((item) => String(item.areacode) === "39");

    // 원본 데이터에서 title 필드가 존재하는지 확인
    const hasTitle = rawItems.length > 0 && "title" in rawItems[0] && rawItems[0].title !== undefined;

    // 프론트엔드 규격으로 정규화 (임의의 가짜 값 생성 금지, 없으면 null 또는 빈 문자열)
    const normalizedItems = jejuItems.map((item) => ({
      contentId: item.contentid ? String(item.contentid) : "",
      title: item.title !== undefined && item.title !== null ? String(item.title) : null,
      address: item.addr1 ? String(item.addr1) : "",
      detailAddress: item.addr2 ? String(item.addr2) : "",
      image: item.firstimage ? String(item.firstimage) : "",
      thumbnail: item.firstimage2 ? String(item.firstimage2) : "",
      longitude: item.mapx ? parseFloat(item.mapx) : null,
      latitude: item.mapy ? parseFloat(item.mapy) : null,
      contentTypeId: item.contenttypeid ? String(item.contenttypeid) : "",
      cat1: item.cat1 ? String(item.cat1) : "",
      cat2: item.cat2 ? String(item.cat2) : "",
      cat3: item.cat3 ? String(item.cat3) : "",
      sigunguCode: item.sigungucode ? String(item.sigungucode) : "",
    }));

    return res.status(200).json({
      success: true,
      pageNo: Number(data?.response?.body?.pageNo || pageNo),
      numOfRows: Number(data?.response?.body?.numOfRows || numOfRows),
      totalCount: Number(data?.response?.body?.totalCount || 0),
      jejuCount: normalizedItems.length,
      hasTitleInRawData: hasTitle,
      items: normalizedItems,
    });

  } catch (error) {
    // API 키나 민감 정보 노출을 방지하면서 내부 에러 응답 반환
    return res.status(500).json({
      error: "공공데이터 API 처리 중 서버 오류가 발생했습니다.",
    });
  }
}
