export default async function handler(req, res) {
  try {
    // Vercel 환경 변수에서 공공데이터 API 키 취득 (절대 노출 금지)
    const serviceKey = process.env.TOUR_API_KEY;

    if (!serviceKey) {
      return res.status(500).json({
        success: false,
        error: "TOUR_API_KEY 환경변수가 설정되어 있지 않습니다.",
      });
    }

    // 쿼리 파라미터
    // source: 'auto' (기본: petTourSyncList2 시도 후 필요시 areaBasedList2 폴백),
    //         'petTourSyncList2' (동기화 목록만 강제),
    //         'areaBasedList2' (제주 지역목록만 강제)
    const { 
      pageNo = "1", 
      numOfRows = "100", 
      contentTypeId,
      source = "auto"
    } = req.query;

    let targetItems = [];
    let sourceApiUsed = "";
    let rawHeader = null;
    let rawTotalCount = 0;
    let fallbackHappened = false;
    let fallbackReason = "";

    // -------------------------------------------------------------
    // 우선순위 A: petTourSyncList2 전체 조회 → 서버에서 areacode=39 필터링
    // -------------------------------------------------------------
    if (source === "auto" || source === "petTourSyncList2") {
      sourceApiUsed = "petTourSyncList2";

      // 1) 1페이지 조회 (주의: petTourSyncList2는 areaCode 파라미터를 지원하지 않으므로 포함하지 않음)
      const page1Params = new URLSearchParams({
        serviceKey: serviceKey,
        MobileOS: "WEB",
        MobileApp: "DANGJeju",
        _type: "json",
        pageNo: "1",
        numOfRows: "1000", // 전국 데이터를 폭넓게 수집하기 위해 1000건 요청
      });

      if (contentTypeId) {
        page1Params.append("contentTypeId", String(contentTypeId));
      }

      const url1 = `https://apis.data.go.kr/B551011/KorService2/petTourSyncList2?${page1Params.toString()}`;
      const res1 = await fetch(url1);
      const text1 = await res1.text();

      let data1 = null;
      try {
        data1 = JSON.parse(text1);
      } catch {
        data1 = null;
      }

      rawHeader = data1?.response?.header || null;
      rawTotalCount = Number(data1?.response?.body?.totalCount || 0);

      let allRawItems = [];
      const itemsObj1 = data1?.response?.body?.items;
      if (itemsObj1 && itemsObj1.item) {
        allRawItems = Array.isArray(itemsObj1.item) ? itemsObj1.item : [itemsObj1.item];
      }

      // 만약 전체 건수가 1,000건을 초과한다면 제주(39)가 뒤 페이지에 있을 수 있으므로 2페이지 추가 조회
      if (rawTotalCount > 1000) {
        try {
          const page2Params = new URLSearchParams({
            serviceKey: serviceKey,
            MobileOS: "WEB",
            MobileApp: "DANGJeju",
            _type: "json",
            pageNo: "2",
            numOfRows: "1000",
          });
          if (contentTypeId) {
            page2Params.append("contentTypeId", String(contentTypeId));
          }
          const url2 = `https://apis.data.go.kr/B551011/KorService2/petTourSyncList2?${page2Params.toString()}`;
          const res2 = await fetch(url2);
          const data2 = await res2.json();
          const itemsObj2 = data2?.response?.body?.items;
          if (itemsObj2 && itemsObj2.item) {
            const page2Items = Array.isArray(itemsObj2.item) ? itemsObj2.item : [itemsObj2.item];
            allRawItems = allRawItems.concat(page2Items);
          }
        } catch {
          // 2페이지 조회 실패 시 1페이지 데이터로 계속 진행
        }
      }

      // 전국 데이터 중 제주특별자치도 (areacode === "39") 데이터만 필터링
      const jejuSyncItems = allRawItems.filter((item) => String(item.areacode) === "39");

      if (jejuSyncItems.length > 0) {
        targetItems = jejuSyncItems;
      } else if (source === "auto") {
        // petTourSyncList2에서 제주 데이터가 0건이면 자동으로 B플랜(areaBasedList2)으로 폴백
        fallbackHappened = true;
        fallbackReason = `petTourSyncList2 응답 총 ${rawTotalCount}건 중 제주(areacode=39) 데이터가 0건이어서 areaBasedList2로 자동 전환했습니다.`;
      }
    }

    // -------------------------------------------------------------
    // 우선순위 B: areaBasedList2 (areaCode=39) 조회
    // (source === 'areaBasedList2' 이거나 petTourSyncList2에서 0건인 경우)
    // -------------------------------------------------------------
    if (source === "areaBasedList2" || (fallbackHappened && targetItems.length === 0)) {
      sourceApiUsed = "areaBasedList2";

      const areaParams = new URLSearchParams({
        serviceKey: serviceKey,
        MobileOS: "WEB",
        MobileApp: "DANGJeju",
        _type: "json",
        areaCode: "39", // 제주특별자치도
        pageNo: String(pageNo || "1"),
        numOfRows: String(numOfRows || "100"),
        arrange: "A", // 제목순 정렬
      });

      if (contentTypeId) {
        areaParams.append("contentTypeId", String(contentTypeId));
      }

      const areaUrl = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?${areaParams.toString()}`;
      const areaRes = await fetch(areaUrl);
      const areaText = await areaRes.text();

      let areaData = null;
      try {
        areaData = JSON.parse(areaText);
      } catch {
        areaData = null;
      }

      rawHeader = areaData?.response?.header || rawHeader;
      rawTotalCount = Number(areaData?.response?.body?.totalCount || 0);

      const itemsObj = areaData?.response?.body?.items;
      if (itemsObj && itemsObj.item) {
        targetItems = Array.isArray(itemsObj.item) ? itemsObj.item : [itemsObj.item];
      }
    }

    // 원본 데이터에 title 필드가 존재하는지 확인
    const hasTitle = targetItems.length > 0 && "title" in targetItems[0] && targetItems[0].title !== undefined && targetItems[0].title !== null;

    // 프론트엔드 정규화 포맷 매핑 (가짜 값 생성 금지, 없으면 null 또는 "")
    const normalizedItems = targetItems.map((item) => ({
      contentId: item.contentid ? String(item.contentid) : "",
      title: item.title !== undefined && item.title !== null && String(item.title).trim() !== "" ? String(item.title) : null,
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
      sourceApi: sourceApiUsed,
      pageNo: Number(pageNo),
      numOfRows: Number(numOfRows),
      totalCount: normalizedItems.length,
      hasTitleInRawData: hasTitle,
      debug: {
        apiCalled: sourceApiUsed,
        resultCode: rawHeader?.resultCode || "0000",
        resultMsg: rawHeader?.resultMsg || "OK",
        rawTotalCount: rawTotalCount,
        jejuFilteredCount: normalizedItems.length,
        hasAreaCodeParamInPetSync: false,
        fallbackHappened: fallbackHappened,
        fallbackReason: fallbackReason || undefined,
      },
      items: normalizedItems,
    });

  } catch (error) {
    // API 키나 민감 정보 노출을 엄격히 차단한 에러 응답
    return res.status(500).json({
      success: false,
      error: "공공데이터 API 처리 중 서버 오류가 발생했습니다.",
    });
  }
}
