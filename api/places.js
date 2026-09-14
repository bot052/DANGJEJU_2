export default async function handler(req, res) {
  try {
    const serviceKey = process.env.TOUR_API_KEY;

    if (!serviceKey) {
      return res.status(500).json({
        success: false,
        error: "TOUR_API_KEY 환경변수가 설정되어 있지 않습니다.",
      });
    }

    // 기본 단위: pageNo=1, numOfRows=30
    const { 
      pageNo = "1", 
      numOfRows = "30", 
      contentTypeId 
    } = req.query;

    // 1. areaBasedList2로 제주특별자치도(areaCode=39) 관광지 목록 조회
    const areaParams = new URLSearchParams({
      serviceKey: serviceKey,
      MobileOS: "WEB",
      MobileApp: "DANGJeju",
      _type: "json",
      areaCode: "39",
      pageNo: String(pageNo),
      numOfRows: String(numOfRows),
      arrange: "A", // 제목순
    });

    if (contentTypeId) {
      areaParams.append("contentTypeId", String(contentTypeId));
    }

    const areaUrl = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?${areaParams.toString()}`;
    const areaResponse = await fetch(areaUrl);
    const areaText = await areaResponse.text();

    let areaData;
    try {
      areaData = JSON.parse(areaText);
    } catch {
      return res.status(502).json({
        success: false,
        error: "areaBasedList2 응답을 JSON으로 파싱하지 못했습니다.",
      });
    }

    const header = areaData?.response?.header;
    if (header && header.resultCode && header.resultCode !== "0000") {
      return res.status(502).json({
        success: false,
        error: `공공데이터 API 오류: ${header.resultMsg || "비정상 응답"}`,
        resultCode: header.resultCode,
      });
    }

    const sourceTotalCount = Number(areaData?.response?.body?.totalCount || 0);

    let rawPlaces = [];
    const itemsObj = areaData?.response?.body?.items;
    if (itemsObj && itemsObj.item) {
      rawPlaces = Array.isArray(itemsObj.item) ? itemsObj.item : [itemsObj.item];
    }

    const checkedCount = rawPlaces.length;

    // 2. 요청된 목록의 각 contentid에 대해 detailPetTour2 병렬 호출
    const petCheckPromises = rawPlaces.map(async (place) => {
      const contentId = place.contentid ? String(place.contentid) : "";
      if (!contentId) return null;

      try {
        const petParams = new URLSearchParams({
          serviceKey: serviceKey,
          MobileOS: "WEB",
          MobileApp: "DANGJeju",
          _type: "json",
          contentId: contentId,
        });

        const petUrl = `https://apis.data.go.kr/B551011/KorService2/detailPetTour2?${petParams.toString()}`;
        const petResponse = await fetch(petUrl);
        const petText = await petResponse.text();
        const petData = JSON.parse(petText);

        const petBody = petData?.response?.body;
        const petTotalCount = Number(petBody?.totalCount || 0);
        const petItems = petBody?.items?.item;

        // 3. detailPetTour2에서 response.body.totalCount > 0 또는 items.item이 존재하는 장소만 남김
        let petInfo = null;
        if (petTotalCount > 0 && petItems) {
          petInfo = Array.isArray(petItems) ? petItems[0] : petItems;
        } else if (petItems) {
          petInfo = Array.isArray(petItems) ? petItems[0] : petItems;
        }

        // 반려동물 정보가 없으면 제외
        if (!petInfo) {
          return null;
        }

        // 4. 기본 관광정보와 반려동물 정보 병합
        return {
          contentId: contentId,
          title: place.title ? String(place.title) : null,
          address: place.addr1 ? String(place.addr1) : "",
          detailAddress: place.addr2 ? String(place.addr2) : "",
          image: place.firstimage ? String(place.firstimage) : "",
          thumbnail: place.firstimage2 ? String(place.firstimage2) : "",
          longitude: place.mapx ? parseFloat(place.mapx) : null,
          latitude: place.mapy ? parseFloat(place.mapy) : null,
          contentTypeId: place.contenttypeid ? String(place.contenttypeid) : "",
          cat1: place.cat1 ? String(place.cat1) : "",
          cat2: place.cat2 ? String(place.cat2) : "",
          cat3: place.cat3 ? String(place.cat3) : "",
          sigunguCode: place.sigungucode ? String(place.sigungucode) : "",

          // 필수 반려동물 정보 필드
          petType: petInfo.acmpyTypeCd || "",
          petAllowed: petInfo.acmpyPsblCpam || "",
          petNeed: petInfo.acmpyNeedMtr || "",
          petInfo: petInfo.etcAcmpyInfo || "",
          petRisk: petInfo.relaAcdntRiskMtr || "",
          petFacilities: petInfo.relaPosesFclty || "",
          petProvidedItems: petInfo.relaFrnshPrdlst || "",
          petPurchaseItems: petInfo.relaPurcPrdlst || "",
          petIndoorInfo: petInfo.relaIntLrdl || "",
        };
      } catch {
        // 개별 장소 상세조회 오류 시 해당 장소는 안전하게 제외
        return null;
      }
    });

    const checkedResults = await Promise.all(petCheckPromises);

    // 5. 반려동물 정보가 확인된 장소만 최종 items로 필터링
    const matchedItems = checkedResults.filter(Boolean);

    return res.status(200).json({
      success: true,
      pageNo: Number(pageNo),
      numOfRows: Number(numOfRows),
      sourceTotalCount: sourceTotalCount,
      checkedCount: checkedCount,
      petMatchedCount: matchedItems.length,
      items: matchedItems,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "제주 반려동물 동반 장소 목록 처리 중 서버 오류가 발생했습니다.",
    });
  }
}
