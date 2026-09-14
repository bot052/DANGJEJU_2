export type RegionId =
  | 'all'         // 전체
  | 'jeju_city'   // 제주시
  | 'seogwipo'    // 서귀포시
  | 'east'        // 동부 (구좌, 조천, 성산, 표선 등)
  | 'west';       // 서부 (애월, 한림, 한경, 안덕, 대정 등)

export interface RegionInfo {
  id: RegionId;
  name: string;
  subName: string;
  description: string;
}

export interface EventBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  date?: string;
  location?: string;
  tag?: string;
  linkText?: string;
}

export type PlaceCategory = 'all' | 'cafe' | 'spot' | 'food' | 'trail' | 'stay';

export interface Place {
  id: string;              // contentId
  contentId: string;       // 한국관광공사 콘텐츠 ID
  name: string;            // 장소명 (title)
  title: string;           // 공공데이터 원본 타이틀
  address: string;         // 기본 주소 + 상세 주소
  detailAddress?: string;  // 상세 주소
  imageUrl: string;        // 대표 이미지 (image 또는 thumbnail 또는 기본값)
  image?: string;          // 원본 대형 이미지
  thumbnail?: string;      // 원본 썸네일 이미지
  coordinates: {
    lat: number;           // 위도 (latitude)
    lng: number;           // 경도 (longitude)
  };
  latitude: number;
  longitude: number;
  contentTypeId: string;   // 12: 관광지, 14: 문화시설, 28: 레포츠, 32: 숙박, 39: 음식점
  cat1?: string;
  cat2?: string;
  cat3?: string;
  sigunguCode?: string;
  region: RegionId;        // 자동 매핑된 지역 (east, west, jeju_city, seogwipo)
  regionName: string;      // 지역 표시명 (동부, 서부, 제주시, 서귀포시)
  category: PlaceCategory; // 유형 (spot, trail, stay, cafe, food)

  // 공공데이터 TourAPI 4.0 반려동물 전용 정보 (detailPetTour2)
  petType?: string;          // 동반 가능 구역 (예: 전구역 동반가능, 일부구역 동반가능)
  petAllowed?: string;       // 동반 가능 견종/범위 (예: 전 견종 동반 가능, 9kg 이하 등)
  petNeed?: string;          // 필수사항 (예: 목줄 착용, 입마개 착용, 이동장 사용 등)
  petInfo?: string;          // 주의사항 / 기타 안내
  petRisk?: string;          // 위험/주의 정보 (훈련사 상시대기, 동의서 작성 등)
  petFacilities?: string;    // 반려동물 관련시설
  petProvidedItems?: string; // 비치품목
  petPurchaseItems?: string; // 구매가능 품목
  petIndoorInfo?: string;    // 실내 관련 안내
}
