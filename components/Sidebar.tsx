import React from 'react';
import { LayoutDashboard, Briefcase, FileText, UserCircle2, Settings, LogOut, CheckCircle } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  hasUnreadMessages?: boolean;
}

// Custom Icon for Claire (Girl with Bob Cut & Headphones)
const ClaireIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Hair Top */}
    <path d="M4.5 11c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" />
    
    {/* Hair Sides (Bob) */}
    <path d="M4.5 11v4a3 3 0 0 0 3 3" />
    <path d="M19.5 11v4a3 3 0 0 1-3 3" />
    
    {/* Headphone Cups */}
    <rect x="2" y="9" width="3" height="6" rx="1.5" />
    <rect x="19" y="9" width="3" height="6" rx="1.5" />
    
    {/* Face/Chin */}
    <path d="M8 13v1a4 4 0 0 0 8 0v-1" />
    
    {/* Bangs */}
    <path d="M5 11c2.3 2 4.7 2 7 0c2.3 2 4.7 2 7 0" />
    
    {/* Shoulders */}
    <path d="M6 22a6 6 0 0 1 6-5h0a6 6 0 0 1 6 5" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasUnreadMessages = false }) => {
  const mainNavItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.JOBS, label: 'My Applications', icon: Briefcase },
    { id: ViewState.OFFERS, label: 'Offers Received', icon: CheckCircle },
    { id: ViewState.RESUME, label: 'Resume Builder', icon: FileText },
    { id: ViewState.AVATAR, label: 'AI Avatar', icon: UserCircle2 },
  ];

  return (
    <div className="w-64 bg-brand-primary h-screen border-r border-white/20 flex flex-col flex-shrink-0 no-print sticky top-0 shadow-xl shadow-brand-primary/20 z-20">
      <style>
        {`
        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .claire-notify {
          position: relative;
          z-index: 0;
          overflow: hidden;
        }
        .claire-notify::before {
          content: '';
          position: absolute;
          top: -3px; left: -3px; right: -3px; bottom: -3px;
          background: linear-gradient(45deg, #fff, #58eac6, #008b7d, #58eac6, #fff);
          background-size: 300% 300%;
          z-index: -1;
          animation: border-flow 2s ease infinite;
          border-radius: 14px;
        }
        .claire-notify-blink {
          animation: blink-shadow 2s infinite;
        }
        @keyframes blink-shadow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        `}
      </style>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">CareerPilot</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold ${
                isActive
                  ? 'bg-white text-brand-deep shadow-lg shadow-black/5'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-brand-deep' : 'text-white'} />
              {item.label}
            </button>
          );
        })}

        {/* Separator for Claire */}
        <div className="my-2 border-t border-white/20 mx-2"></div>

        <div className={hasUnreadMessages ? 'claire-notify rounded-xl' : ''}>
          <button
            onClick={() => onChangeView(ViewState.CLAIRE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold ${
              currentView === ViewState.CLAIRE
                ? 'bg-white text-brand-deep shadow-lg shadow-black/5'
                : hasUnreadMessages 
                  ? 'bg-white text-brand-deep shadow-lg claire-notify-blink' // Active looking style for unread
                  : 'text-white hover:bg-white/20'
            }`}
          >
            <ClaireIcon size={20} className={currentView === ViewState.CLAIRE || hasUnreadMessages ? 'text-brand-deep' : 'text-white'} />
            <span className="flex-1 text-left">Claire</span>
            {hasUnreadMessages && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/20 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-colors font-bold">
          <Settings size={20} className="text-white" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-colors font-bold">
          <LogOut size={20} className="text-white" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;