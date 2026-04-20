import { Settings } from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onSettingsClick: () => void;
}

export default function Header({ activeTab, onTabChange, onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bumble-gold shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-bumble-dark rounded-full flex items-center justify-center">
            <span className="text-bumble-gold text-xs font-black">B</span>
          </div>
          <span className="text-bumble-dark text-xl font-black tracking-tight">bumble</span>
        </div>
        <button
          onClick={onSettingsClick}
          className="text-bumble-dark p-1 hover:bg-yellow-500 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
      </div>

      <nav className="flex border-t border-yellow-400/40">
        {(['initiator', 'rankings', 'matchProfile'] as ViewTab[]).map((tab) => {
          const labels: Record<ViewTab, string> = {
            initiator: 'Initiator Profile',
            rankings: 'Rankings',
            matchProfile: 'Match Profile',
          };
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-2.5 text-sm font-bold capitalize tracking-wide transition-all ${
                activeTab === tab
                  ? 'text-bumble-dark border-b-2 border-bumble-dark bg-yellow-400/20'
                  : 'text-bumble-dark/60 hover:text-bumble-dark hover:bg-yellow-400/10'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
