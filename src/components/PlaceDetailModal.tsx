import { useState } from 'react';
import { Place } from '../types';
import { NEUTRAL_IMAGE_PLACEHOLDER } from '../data/places';
import { 
  X, 
  MapPin, 
  Heart, 
  Share2, 
  Check, 
  Dog, 
  AlertTriangle,
  ShoppingBag,
  Gift,
  Building,
  Home,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (placeId: string) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  spot: '관광지',
  trail: '산책로',
  stay: '숙소',
  cafe: '카페',
  food: '음식점',
};

export default function PlaceDetailModal({
  place,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
}: PlaceDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pet' | 'location'>('pet');

  if (!isOpen || !place) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(place.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `[댕제주] ${place.name}`,
        text: `제주 반려견 동반 여행지: ${place.name} (${place.address})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyAddress();
    }
  };

  const categoryName = CATEGORY_NAMES[place.category] || '관광지';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image with Badges */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900 flex-shrink-0">
          <img
            src={place.imageUrl || NEUTRAL_IMAGE_PLACEHOLDER}
            alt={place.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== NEUTRAL_IMAGE_PLACEHOLDER) {
                target.src = NEUTRAL_IMAGE_PLACEHOLDER;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id={`modal-save-btn-${place.id}`}
              onClick={() => onToggleSave(place.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-colors shadow-sm ${
                isSaved ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
              title="관심 장소 저장"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              id={`modal-share-btn-${place.id}`}
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-colors shadow-sm"
              title="공유하기"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title Info over Hero */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {place.regionName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {categoryName}
              </span>
              {place.petType && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md">
                  🐾 {place.petType}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {place.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
              {place.address}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-5 pt-3 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('pet')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pet'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Dog className="w-4 h-4" />
            반려동물 동반 정보
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            위치 & 길찾기
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'pet' && (
            <div className="space-y-4">
              {/* 핵심 동반 조건 3종 그리드 (값이 있는 항목만 카드 렌더링) */}
              {(place.petType || place.petAllowed || place.petNeed) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {place.petType && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-amber-800">동반 가능 구역</span>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        {place.petType}
                      </p>
                    </div>
                  )}

                  {place.petAllowed && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-indigo-800">동반 가능 견종/범위</span>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        {place.petAllowed}
                      </p>
                    </div>
                  )}

                  {place.petNeed && (
                    <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-rose-800">필수사항</span>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        {place.petNeed}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 상세 안내 및 주의사항 (petInfo) */}
              {place.petInfo && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    반려동물 동반 주의사항 & 안내
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {place.petInfo}
                  </div>
                </div>
              )}

              {/* 위험 및 안전 정보 (petRisk) */}
              {place.petRisk && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    위험 및 안전 유의사항
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
                    {place.petRisk}
                  </p>
                </div>
              )}

              {/* 실내 관련 안내 (petIndoorInfo) */}
              {place.petIndoorInfo && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-blue-600" />
                    실내 공간 동반 안내
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {place.petIndoorInfo}
                  </p>
                </div>
              )}

              {/* 반려동물 관련시설 (petFacilities) */}
              {place.petFacilities && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" />
                    반려동물 편의 시설
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-950 font-semibold">
                    {place.petFacilities}
                  </p>
                </div>
              )}

              {/* 비치품목 & 구매가능 품목 그리드 (둘 중 하나라도 있을 때만 렌더링) */}
              {(place.petProvidedItems || place.petPurchaseItems) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {place.petProvidedItems && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-teal-600" />
                        현장 무료 비치 품목
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                        {place.petProvidedItems}
                      </p>
                    </div>
                  )}

                  {place.petPurchaseItems && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                        구매 가능 품목
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                        {place.petPurchaseItems}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* 주소 정보 및 복사 버튼 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">등록 주소</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">
                        {place.address}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사완료' : '주소 복사'}
                  </button>
                </div>
              </div>

              {/* 지도 길찾기 버튼 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  카카오맵으로 길찾기
                </a>
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  네이버 지도로 보기
                </a>
              </div>

              {/* 공공데이터 출처 안내 */}
              <div className="p-3.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 border border-slate-200/60 leading-normal">
                본 정보는 <strong>한국관광공사 TourAPI 4.0 (제주 반려동물 동반 여행 정보)</strong> 공공데이터를 기반으로 실시간 제공됩니다. (콘텐츠 ID: {place.contentId})
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>한국관광공사 등록 제주 반려동물 동반 장소</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
