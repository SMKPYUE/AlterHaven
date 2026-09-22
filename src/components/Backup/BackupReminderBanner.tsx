import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { ShieldAlert, Download, X, Check, Sparkles } from 'lucide-react';

export const BackupReminderBanner: React.FC = () => {
  const {
    system,
    alters,
    lastBackupTimestamp,
    dismissedBackupReminderUntil,
    recordBackup,
    dismissBackupReminder,
    exportAllData,
  } = useSystemStore();

  const [downloaded, setDownloaded] = useState(false);

  // Check dismissal timestamp
  const now = Date.now();
  if (dismissedBackupReminderUntil && now < dismissedBackupReminderUntil) {
    return null;
  }

  let shouldShow = false;
  let message = '';

  if (lastBackupTimestamp) {
    const daysSince = Math.floor((now - lastBackupTimestamp) / (24 * 60 * 60 * 1000));
    if (daysSince >= 5) {
      shouldShow = true;
      message = `You haven't exported a system backup in ${daysSince} days.`;
    }
  } else {
    // If never backed up and has alters
    if (alters.length > 0) {
      shouldShow = true;
      message = 'You have not exported an offline system backup yet.';
    }
  }

  if (!shouldShow) return null;

  const handleQuickDownload = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alterhaven_backup_${system.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    recordBackup();
    setDownloaded(true);
    setTimeout(() => {
      dismissBackupReminder(7);
      setDownloaded(false);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 px-4 py-2.5 shadow-lg relative z-30 animate-in fade-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-200">Data Safety Failsafe: </span>
            <span className="text-slate-300">
              {message} Download a 1-click JSON backup to protect your system records from unexpected browser cache clears.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleQuickDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-900" />
                <span>Backup Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>1-Click Backup (.json)</span>
              </>
            )}
          </button>

          <button
            onClick={() => dismissBackupReminder(3)}
            className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Remind in 3 days"
          >
            Remind in 3 days
          </button>

          <button
            onClick={() => dismissBackupReminder(1)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Dismiss for 1 day"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
