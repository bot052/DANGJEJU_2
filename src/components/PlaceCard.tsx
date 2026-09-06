import React from 'react';
import { Place } from '../types';
import { MapPin, Heart, Car, ChevronRight } from 'lucide-react';

interface PlaceCardProps {
  key?: string;
  place: Place;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (place: Place) => void;
  onToggleSave: (placeId: string) => void;
  onOpenDetail: (place: Place) => void;
}

const CATEGORY_STYLES: Record<string, { label: string; badgeClass: string; icon: string }> = {
  cafe: { label: '카페·베이커리', badgeClass: 'bg-orange-100 text-orange-800 border-orange-200', icon: '☕' },
  spot: { label: '관광지·체험', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🎡' },
  food: { label: '음식점·식당', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200', icon: '🍽️' },
  trail: { label: '산책로·해변', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🌿' },
  stay: { label: '숙소·펜션', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🏡' },
};

export default function PlaceCard({
  place,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
  onOpenDetail,
}: PlaceCardProps) {
  const cat = CATEGORY_STYLES[place.category] || {
    label: '명소',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: '📍',
  };

  const allowsLarge = place.petPolicy.allowedSizes.includes('large');
  const allowsIndoor = place.petPolicy.indoorAllowed;
  const allowsOutdoor = place.petPolicy.outdoorAllowed;

  const handleCardClick = () => {
    onSelect(place);
    onOpenDetail(place);
  };

  return (
    <div
      id={`place-card-${place.id}`}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col md:flex-row hover:shadow-xl hover:-translate-y-0.5 ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-lg bg-amber-50/15'
          : 'border-slate-200/90 hover:border-amber-300 shadow-xs'
      }`}
    >
      {/* Large Thumbnail Section */}
      <div className="relative w-full md:w-64 lg:w-72 h-52 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-t md:from-black/35" />

        {/* Category Badge on photo */}
        <div className="absolute top-3.5 left-3.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${cat.badgeClass}`}>
            {cat.icon} {cat.label}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          id={`bookmark-card-btn-${place.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(place.id);
          }}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isSaved
              ? 'bg-rose-500 text-white scale-110 shadow-rose-500/30'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500 hover:scale-105'
          }`}
          title="찜한 장소 저장"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Region & Off-leash badge on photo bottom */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-white text-xs font-bold drop-shadow-md">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{place.regionName}</span>
          {place.petPolicy.offLeashZoneAvailable && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-black backdrop-blur-xs">
              오프리쉬존
            </span>
          )}
        </div>
      </div>

      {/* Rich Card Body - Spacious, All Information Clearly Visible */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Header Row: Title & Road Address */}
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors tracking-tight leading-snug">
              {place.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{place.roadAddress || place.address}</span>
            </p>
          </div>

          {/* Detailed Description */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2 line-clamp-2">
            {place.shortDesc}
          </p>

          {/* Detailed Pet Policy Badges */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {/* 체급 조건 */}
            {allowsLarge ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs">
                🐕 <strong>대형견 환영</strong> (30kg 이상 가능)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-200/70 text-xs">
                🐕 <strong>소·중형견 가능</strong>
              </span>
            )}

            {/* 실내/야외 공간 */}
            {allowsIndoor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs">
                🏡 실내 동반 가능
              </span>
            )}
            {allowsOutdoor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-amber-50 text-amber-800 border border-amber-200/70 text-xs">
                🌿 야외 테라스/마당
              </span>
            )}

            {/* 반려견 입장료 */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-slate-50 text-slate-600 border border-slate-200/60 text-xs">
              💰 {place.petPolicy.petFee ? `반려견 ${place.petPolicy.petFee.toLocaleString()}원` : '반려견 무료 입장'}
            </span>
          </div>

          {/* Key Amenities */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {place.amenities.freeParking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                <Car className="w-3 h-3 text-slate-500" /> 무료 주차장
              </span>
            )}
            {place.amenities.dogMenu && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200/60 text-[11px] font-bold">
                ☕ 멍푸치노/간식
              </span>
            )}
            {place.amenities.fencedYard && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-bold">
                🐾 천연잔디 운동장
              </span>
            )}
            {place.amenities.photoZone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60 text-[11px] font-bold">
                📸 포토존
              </span>
            )}
          </div>
        </div>

        {/* Bottom Bar: Tags & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {place.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[11px] font-bold text-amber-700 bg-amber-50/70 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleCardClick}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-xs hover:from-amber-600 hover:to-orange-600 transition-all shrink-0"
          >
            <span>상세보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
