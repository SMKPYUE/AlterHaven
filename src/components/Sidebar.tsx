import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  History,
  HeartPulse,
  Users,
  Settings,
  Shield,
  BookOpen,
  Vote,
  Contact,
  FileText,
  QrCode,
  Download,
  PenTool,
} from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

export type TabType =
  | 'corkboard'
  | 'journal'
  | 'tasks'
  | 'chat'
  | 'front_tracker'
  | 'body_care'
  | 'alters'
  | 'codex'
  | 'polls'
  | 'contacts'
  | 'clinical_report'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenInstallModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInstallModal,
}) => {
  const { tasks, webhooks, activeFronts, alters, openQrSyncModal, polls } = useSystemStore();

  const mainFront = alters.find((a) => a.id === activeFronts.find((f) => f.status === 'front')?.alterId);
  const pendingTasksCount = tasks.filter(
    (t) => t.status === 'requested' && (!mainFront || t.assignedAlterId === mainFront.id)
  ).length;

  const activePollsCount = polls.filter((p) => p.status === 'active').length;
  const enabledWebhooks = webhooks.filter((w) => w.isEnabled).length;

  const navItems = [
    {
      id: 'corkboard' as TabType,
      label: 'Corkboard',
      icon: LayoutDashboard,
      description: 'Spatial notes & widgets',
    },
    {
      id: 'journal' as TabType,
      label: 'System Journal',
      icon: PenTool,
      description: 'Reflections & therapy logs',
    },
    {
      id: 'tasks' as TabType,
      label: 'Missions & Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      description: 'Delegation & handoffs',
    },
    {
      id: 'chat' as TabType,
      label: 'Inner Chat',
      icon: MessageSquare,
      description: 'Channels & voice memos',
    },
    {
      id: 'front_tracker' as TabType,
      label: 'Front Tracker',
      icon: History,
      description: 'Switches & time history',
    },
    {
      id: 'body_care' as TabType,
      label: 'Body Care & Grounding',
      icon: HeartPulse,
      description: 'Meters, meds & 5-4-3-2-1',
    },
    {
      id: 'alters' as TabType,
      label: 'System & Alters',
      icon: Users,
      description: 'Profiles & private vaults',
    },
    {
      id: 'codex' as TabType,
      label: 'System Codex',
      icon: BookOpen,
      description: 'Agreements & rules',
    },
    {
      id: 'polls' as TabType,
      label: 'Decisions & Polls',
      icon: Vote,
      badge: activePollsCount > 0 ? `${activePollsCount} open` : undefined,
      badgeColor: 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50',
      description: 'Internal consensus',
    },
    {
      id: 'contacts' as TabType,
      label: 'Contacts & Masking',
      icon: Contact,
      description: 'Disclosure & boundaries',
    },
    {
      id: 'clinical_report' as TabType,
      label: 'Clinical Export',
      icon: FileText,
      description: 'Therapy summary & PDF',
    },
    {
      id: 'settings' as TabType,
      label: 'Settings & Webhooks',
      icon: Settings,
      badge: enabledWebhooks > 0 ? `${enabledWebhooks} live` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      description: 'Discord & preferences',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 shrink-0 select-none overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Security Badge & Quick Sync Trigger */}
      <div className="mt-4 space-y-2">
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-full px-3 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
              <span>Install App</span>
            </div>
            <span className="text-[10px] text-indigo-300 bg-indigo-900/80 px-1.5 py-0.5 rounded">
              PWA
            </span>
          </button>
        )}

        <button
          onClick={openQrSyncModal}
          className="w-full px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>Local Device Sync</span>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-900/80 px-1.5 py-0.5 rounded">
            P2P
          </span>
        </button>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local-First & Private</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            100% stored securely on your local device.
          </p>
        </div>
      </div>
    </aside>
  );
};

