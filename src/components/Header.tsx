import { Dog, Heart, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onReloadLoading?: () => void;
  onResetHome?: () => void;
}

export default function Header({
  savedCount,
  onOpenSaved,
  onReloadLoading,
  onResetHome,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline - 클릭 시 초기화된 홈화면으로 이동 */}
        <div 
          onClick={onResetHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="처음 홈화면으로 돌아가기 (초기화)"
        >
          <div 
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:rotate-6 group-hover:scale-105 transition-transform"
          >
            <Dog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">
                댕제주
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <span>제주 반려견 스마트 관광 도우미</span>
              <span className="text-amber-500"></span>
            </p>
          </div>
        </div>

        {/* Right side actions: Saved places */}
        <div className="flex items-center gap-2">
          {onReloadLoading && (
            <button
              onClick={onReloadLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
              title="로딩 화면 다시보기"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>인트로</span>
            </button>
          )}

          <button
            id="saved-places-header-btn"
            onClick={onOpenSaved}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              savedCount > 0
                ? 'bg-rose-50/80 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${savedCount > 0 ? 'text-rose-500 fill-current' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">찜한 장소</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
