import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  History,
  HeartPulse,
  Users,
  Settings,
  BookOpen,
  Vote,
  Contact,
  FileText,
  PenTool,
} from 'lucide-react';
import { TabType } from './Sidebar';
import { useSystemStore } from '../store/useSystemStore';
import { SoundEngine } from '../utils/soundEffects';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { tasks, devicePrefs, activeFronts, alters, polls } = useSystemStore();

  const mainFront = alters.find((a) => a.id === activeFronts.find((f) => f.status === 'front')?.alterId);
  const pendingTasksCount = tasks.filter(
    (t) => t.status === 'requested' && (!mainFront || t.assignedAlterId === mainFront.id)
  ).length;

  const activePollsCount = polls.filter((p) => p.status === 'active').length;

  const tabs = [
    { id: 'corkboard' as TabType, label: 'Board', icon: LayoutDashboard },
    { id: 'journal' as TabType, label: 'Journal', icon: PenTool },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'codex' as TabType, label: 'Codex', icon: BookOpen },
    { id: 'polls' as TabType, label: 'Polls', icon: Vote, badge: activePollsCount > 0 ? activePollsCount : undefined },
    { id: 'contacts' as TabType, label: 'People', icon: Contact },
    { id: 'body_care' as TabType, label: 'Care', icon: HeartPulse },
    { id: 'alters' as TabType, label: 'Alters', icon: Users },
    { id: 'clinical_report' as TabType, label: 'Report', icon: FileText },
    { id: 'front_tracker' as TabType, label: 'Switches', icon: History },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 flex items-center gap-1 overflow-x-auto scrollbar-none select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative shrink-0 min-w-[56px] ${
              isActive
                ? 'text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-indigo-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{tab.label}</span>

            {tab.badge !== undefined && (
              <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 font-extrabold text-[8px] rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

