import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CorkboardView } from './components/Corkboard/CorkboardView';
import { TaskManager } from './components/Tasks/TaskManager';
import { InnerChat } from './components/Chat/InnerChat';
import { FrontTrackerView } from './components/FrontTracker/FrontTrackerView';
import { BodyCareView } from './components/BodyCare/BodyCareView';
import { AlterDirectory } from './components/Alters/AlterDirectory';
import { CodexView } from './components/Codex/CodexView';
import { PollsView } from './components/Polls/PollsView';
import { ContactsView } from './components/Contacts/ContactsView';
import { ClinicalReportView } from './components/ClinicalReport/ClinicalReportView';
import { SettingsView } from './components/Settings/SettingsView';
import { FrontSwitcherModal } from './components/Alters/FrontSwitcherModal';
import { HandoffBriefingModal } from './components/Tasks/HandoffBriefingModal';
import { QrSyncModal } from './components/Sync/QrSyncModal';
import { PwaInstallModal } from './components/Install/PwaInstallModal';
import { useSystemStore } from './store/useSystemStore';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('corkboard');
  const [isFrontModalOpen, setIsFrontModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const {
    isBriefingModalOpen,
    briefingAlterId,
    closeBriefingModal,
    openBriefingModal,
    isQrSyncModalOpen,
    closeQrSyncModal,
    devicePrefs,
  } = useSystemStore();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileLayout =
    devicePrefs.viewMode === 'mobile' ||
    (devicePrefs.viewMode === 'auto' && windowWidth < 768);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        onOpenFrontModal={() => setIsFrontModalOpen(true)}
        onOpenBriefingModal={(alterId) => openBriefingModal(alterId)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Navigation Sidebar (Hidden in Mobile Mode) */}
        {!isMobileLayout && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}

        {/* Dynamic Main View */}
        <main
          className={`flex-1 overflow-y-auto bg-slate-950/90 relative ${
            isMobileLayout ? 'pb-16' : ''
          }`}
        >
          {activeTab === 'corkboard' && <CorkboardView />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'chat' && <InnerChat />}
          {activeTab === 'front_tracker' && (
            <FrontTrackerView onOpenFrontModal={() => setIsFrontModalOpen(true)} />
          )}
          {activeTab === 'body_care' && <BodyCareView />}
          {activeTab === 'alters' && <AlterDirectory />}
          {activeTab === 'codex' && <CodexView />}
          {activeTab === 'polls' && <PollsView />}
          {activeTab === 'contacts' && <ContactsView />}
          {activeTab === 'clinical_report' && <ClinicalReportView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible in Mobile Mode) */}
      {isMobileLayout && (
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Global Front Switcher Modal */}
      {isFrontModalOpen && (
        <FrontSwitcherModal onClose={() => setIsFrontModalOpen(false)} />
      )}

      {/* Global Handoff Briefing Modal */}
      {isBriefingModalOpen && briefingAlterId && (
        <HandoffBriefingModal
          alterId={briefingAlterId}
          onClose={closeBriefingModal}
        />
      )}

      {/* Direct Local QR Device Sync Modal */}
      {isQrSyncModalOpen && (
        <QrSyncModal onClose={closeQrSyncModal} />
      )}

      {/* PWA Home Screen Installation Modal */}
      {isInstallModalOpen && (
        <PwaInstallModal onClose={() => setIsInstallModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
