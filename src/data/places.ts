import { Place, RegionId, RegionInfo, PlaceCategory } from '../types';
import rawPetPlaces from './jeju-pet-places.json';

export const REGIONS: RegionInfo[] = [
  { id: 'all', name: '전체', subName: '제주 전역', description: '제주도 전역의 모든 반려견 동반 공공 등록 명소' },
  { id: 'jeju_city', name: '제주시', subName: '도심/북부', description: '도두봉, 공항 인근 및 제주시내 명소' },
  { id: 'seogwipo', name: '서귀포시', subName: '남부 휴양', description: '돈내코, 중문, 서귀포 도심 일대' },
  { id: 'east', name: '동부', subName: '구좌·조천·성산·표선', description: '섭지코지, 성읍민속마을, 거슨새미오름 등' },
  { id: 'west', name: '서부', subName: '애월·한림·한경·대정·안덕', description: '금오름, 한림공원, 마라도, 산양큰엉곶 등' },
];

/**
 * 주소를 기반으로 5대 권역(east, west, jeju_city, seogwipo)을 판별
 * 우선순위:
 * 1. 구좌읍, 조천읍, 성산읍, 표선면 -> east
 * 2. 애월읍, 한림읍, 한경면, 대정읍, 안덕면 -> west
 * 3. 그 외 제주시 -> jeju_city
 * 4. 그 외 서귀포시 -> seogwipo
 */
export function resolveRegion(address: string): { region: RegionId; regionName: string } {
  const addr = address || '';

  if (
    addr.includes('구좌읍') ||
    addr.includes('조천읍') ||
    addr.includes('성산읍') ||
    addr.includes('표선면')
  ) {
    return { region: 'east', regionName: '동부' };
  }

  if (
    addr.includes('애월읍') ||
    addr.includes('한림읍') ||
    addr.includes('한경면') ||
    addr.includes('대정읍') ||
    addr.includes('안덕면')
  ) {
    return { region: 'west', regionName: '서부' };
  }

  if (addr.includes('서귀포시')) {
    return { region: 'seogwipo', regionName: '서귀포시' };
  }

  return { region: 'jeju_city', regionName: '제주시' };
}

/**
 * 공공데이터 contentTypeId 및 cat1~cat3, 타이틀을 분석하여 5대 카테고리 매핑
 * - contentTypeId 32 또는 B02: stay (숙소)
 * - contentTypeId 39 또는 A05: food / cafe
 * - 오름, 둘레길, 폭포, 도로 등 자연 산책 코스: trail (산책로)
 * - 기타 문화시설/관광지: spot (관광지)
 */
export function resolveCategory(item: {
  title: string;
  contentTypeId: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
}): PlaceCategory {
  const { title, contentTypeId, cat1, cat3 } = item;

  // 숙박 시설
  if (contentTypeId === '32' || cat1 === 'B02') {
    return 'stay';
  }

  // 음식점 / 식음료
  if (contentTypeId === '39' || cat1 === 'A05') {
    return 'food';
  }

  // 산책로 및 자연 경관 (오름, 폭포, 둘레길, 유채꽃도로 등)
  if (
    cat3 === 'A01010400' || // 오름
    cat3 === 'A01010900' || // 폭포
    title.includes('오름') ||
    title.includes('둘레길') ||
    title.includes('폭포') ||
    title.includes('도로') ||
    title.includes('숲') ||
    title.includes('곶')
  ) {
    return 'trail';
  }

  // 기본값: 관광지/체험
  return 'spot';
}

/**
 * 사진이 제공되지 않는 공공데이터 장소를 위한 중립적인 플레이스홀더
 * (다른 관광지나 임의의 풍경 사진을 사용하지 않고 '등록된 사진 없음' 중립 플레이스홀더만 사용)
 */
export const NEUTRAL_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpath d='M160 130a24 24 0 1 0 48 0 24 24 0 0 0-48 0zm-40 90h160l-50-65-35 45-25-30-50 50z' fill='%23cbd5e1'/%3E%3Ctext x='200' y='260' font-family='system-ui, -apple-system, sans-serif' font-size='14' font-weight='700' fill='%2394a3b8' text-anchor='middle'%3E등록된 사진 없음%3C/text%3E%3C/svg%3E";

/**
 * TourAPI 4.0 정제 JSON 데이터 25개를 Place 객체 배열로 변환하는 Adapter
 */
export function adaptPetPlaces(rawList: typeof rawPetPlaces): Place[] {
  return rawList.map((item) => {
    const fullAddress = item.detailAddress
      ? `${item.address} ${item.detailAddress}`.trim()
      : item.address;

    const { region, regionName } = resolveRegion(fullAddress);
    const category = resolveCategory({
      title: item.title,
      contentTypeId: item.contentTypeId,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
    });

    const rawImage = (item.image && item.image.trim()) || (item.thumbnail && item.thumbnail.trim()) || '';
    const imageUrl = rawImage || NEUTRAL_IMAGE_PLACEHOLDER;

    return {
      id: item.contentId,
      contentId: item.contentId,
      name: item.title,
      title: item.title,
      address: fullAddress,
      detailAddress: item.detailAddress || '',
      imageUrl,
      image: item.image || '',
      thumbnail: item.thumbnail || '',
      coordinates: {
        lat: item.latitude,
        lng: item.longitude,
      },
      latitude: item.latitude,
      longitude: item.longitude,
      contentTypeId: item.contentTypeId,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      sigunguCode: item.sigunguCode,
      region,
      regionName,
      category,

      // 공공데이터 반려동물 정보 매핑
      petType: item.petType ? item.petType.trim() : '',
      petAllowed: item.petAllowed ? item.petAllowed.trim() : '',
      petNeed: item.petNeed ? item.petNeed.trim() : '',
      petInfo: item.petInfo ? item.petInfo.trim() : '',
      petRisk: item.petRisk ? item.petRisk.trim() : '',
      petFacilities: item.petFacilities ? item.petFacilities.trim() : '',
      petProvidedItems: item.petProvidedItems ? item.petProvidedItems.trim() : '',
      petPurchaseItems: item.petPurchaseItems ? item.petPurchaseItems.trim() : '',
      petIndoorInfo: item.petIndoorInfo ? item.petIndoorInfo.trim() : '',
    };
  });
}

// 실제 공공데이터 25개 변환 데이터 제공
export const PLACES: Place[] = adaptPetPlaces(rawPetPlaces);
