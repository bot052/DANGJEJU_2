import { useState } from 'react';
import { Place } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Car, 
  ShieldAlert, 
  Heart, 
  Share2, 
  Check, 
  Compass, 
  Dog, 
  Sparkles,
  ExternalLink,
  Copy
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (placeId: string) => void;
}

export default function PlaceDetailModal({
  place,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
}: PlaceDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'policy' | 'location' | 'tips'>('policy');

  if (!isOpen || !place) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(place.roadAddress || place.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `[댕제주] ${place.name}`,
        text: `제주 반려견 동반 여행지: ${place.name} (${place.shortDesc})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyAddress();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image with Badges */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                {place.regionName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md">
                {place.petPolicy.sizeDescription}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {place.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
              {place.shortDesc}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-5 pt-3 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'policy'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Dog className="w-4 h-4" />
            반려견 동반 조건
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            위치 & 주차 안내
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tips'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            편의 & 주의사항
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'policy' && (
            <div className="space-y-4">
              {/* Pet Acceptance Matrix */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold tracking-wider text-amber-800 uppercase mb-3 flex items-center gap-1.5">
                  <Dog className="w-4 h-4 text-amber-600" />
                  견종 체급별 동반 허용 기준
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className={`p-3 rounded-xl border ${
                    place.petPolicy.allowedSizes.includes('small')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <div className="font-bold text-sm">소형견</div>
                    <div className="text-[11px] mt-0.5 font-medium">10kg 이하</div>
                    <div className="text-xs font-bold mt-1">
                      {place.petPolicy.allowedSizes.includes('small') ? '✓ 동반가능' : '✕ 불가'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    place.petPolicy.allowedSizes.includes('medium')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <div className="font-bold text-sm">중형견</div>
                    <div className="text-[11px] mt-0.5 font-medium">10~20kg</div>
                    <div className="text-xs font-bold mt-1">
                      {place.petPolicy.allowedSizes.includes('medium') ? '✓ 동반가능' : '✕ 불가'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    place.petPolicy.allowedSizes.includes('large')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <div className="font-bold text-sm">대형견</div>
                    <div className="text-[11px] mt-0.5 font-medium">20kg 이상</div>
                    <div className="text-xs font-bold mt-1">
                      {place.petPolicy.allowedSizes.includes('large') ? '✓ 동반가능' : '✕ 불가'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Space & Leash Specifications */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="p-2 rounded-lg bg-white text-slate-700 shadow-xs">
                    <Compass className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">공간 이용 규정</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {place.petPolicy.spaceDescription}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="p-2 rounded-lg bg-white text-slate-700 shadow-xs">
                    <Dog className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">리드줄 / 오프리쉬 안내</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {place.petPolicy.leashDescription}
                    </div>
                  </div>
                </div>

                {place.petPolicy.petFeeDescription && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-white text-slate-700 shadow-xs">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">반려견 입장료 안내</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {place.petPolicy.petFeeDescription}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Address with copy */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">도로명 주소</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        {place.roadAddress}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사완료' : '주소 복사'}
                  </button>
                </div>

                {/* Parking info */}
                <div className="pt-3 border-t border-slate-200/80 flex items-start gap-2.5">
                  <Car className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">주차 공간</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">
                      {place.parkingInfo}
                    </div>
                  </div>
                </div>

                {/* Hours and phone */}
                <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">{place.businessHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={`tel:${place.contactNumber}`} className="text-xs font-medium text-blue-600 hover:underline">
                      {place.contactNumber}
                    </a>
                  </div>
                </div>
              </div>

              {/* Map link buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  카카오맵으로 길찾기
                </a>
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  네이버 지도로 보기
                </a>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              {/* Pet Amenities checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  반려견 전용 편의 시설
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.freeParking ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 무료 전용 주차
                  </div>
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.dogMenu ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 멍푸치노/강아지간식
                  </div>
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.fencedYard ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 펜스 안전 운동장
                  </div>
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.waterBowlProvided ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 반려견 식수그릇
                  </div>
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.wasteBagsProvided ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 배변봉투/패드 비치
                  </div>
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${
                    place.amenities.photoZone ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> 반려견 감성 포토존
                  </div>
                </div>
              </div>

              {/* Recommended Points */}
              {place.recommendedPoints && place.recommendedPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    추천 매력 포인트
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {place.recommendedPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Caution Notes */}
              {place.cautionNotes && place.cautionNotes.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    방문 시 주의사항 (필독)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {place.cautionNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>제주 6팀 「댕제주」 실시간 반려견 동반 데이터</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
