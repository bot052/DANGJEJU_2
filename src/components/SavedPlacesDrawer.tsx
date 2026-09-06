import { Place } from '../types';
import { X, Heart, MapPin, Trash2, ChevronRight } from 'lucide-react';

interface SavedPlacesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: Place[];
  onRemove: (id: string) => void;
  onSelect: (place: Place) => void;
}

export default function SavedPlacesDrawer({
  isOpen,
  onClose,
  savedPlaces,
  onRemove,
  onSelect,
}: SavedPlacesDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2100] flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h3 className="font-bold text-base text-slate-800">
              찜한 반려견 여행지 ({savedPlaces.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedPlaces.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">저장된 장소가 없습니다</p>
              <p className="text-xs text-slate-500 mt-1">
                마음에 드는 카페, 관광지, 산책로 카드의 하트를 눌러 보관해보세요.
              </p>
            </div>
          ) : (
            savedPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  onSelect(place);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer bg-white flex gap-3 items-center group"
              >
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{place.regionName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {place.petPolicy.sizeDescription}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(place.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="목록에서 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
          브라우저에 자동 보관되어 언제든 다시 확인할 수 있습니다.
        </div>
      </div>
    </div>
  );
}
