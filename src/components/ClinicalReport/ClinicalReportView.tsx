import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  PieChart,
  HeartPulse,
  Pill,
  BookOpen,
  EyeOff,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import type { ClinicalReportConfig } from '../../types';

export const ClinicalReportView: React.FC = () => {
  const { system, alters, frontLogs, bodyNeeds, rules } = useSystemStore();

  const [config, setConfig] = useState<ClinicalReportConfig>({
    dateRangeDays: 7,
    includeFrontDistribution: true,
    includeBodyMetrics: true,
    includeMedications: true,
    includeTriggers: true,
    includeSystemRulesSummary: true,
    anonymizeAlterNames: false,
  });

  const [isCopied, setIsCopied] = useState(false);

  // Time Window Calculations
  const cutoffTimestamp = Date.now() - config.dateRangeDays * 86400000;
  const filteredLogs = frontLogs.filter((log) => log.startedAt >= cutoffTimestamp);

  // Alter Naming Helper (Anonymization support)
  const getDisplayName = (alterId: string) => {
    const alter = alters.find((a) => a.id === alterId);
    if (!alter) return 'Unknown Identity';
    if (!config.anonymizeAlterNames) return alter.name;

    const alterIndex = alters.findIndex((a) => a.id === alterId) + 1;
    const primaryRole = alter.roles[0] || 'Identity';
    return `Alter #${alterIndex} (${primaryRole})`;
  };

  // Front Distribution stats
  const alterDurations: Record<string, number> = {};
  let totalTrackedTime = 0;

  filteredLogs.forEach((log) => {
    const duration = (log.endedAt || Date.now()) - log.startedAt;
    alterDurations[log.alterId] = (alterDurations[log.alterId] || 0) + duration;
    totalTrackedTime += duration;
  });

  const totalSwitches = filteredLogs.length;

  // Med compliance
  const meds = bodyNeeds.medications || [];
  const takenMedsCount = meds.filter((m) => m.takenToday).length;
  const medComplianceRate = meds.length > 0 ? Math.round((takenMedsCount / meds.length) * 100) : 100;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Generate Markdown Summary
  const generateMarkdown = () => {
    let md = `# Clinical & Therapy Summary Report\n`;
    md += `**System:** ${system.name}\n`;
    md += `**Date Generated:** ${new Date().toLocaleDateString()} (Period: Last ${config.dateRangeDays} days)\n`;
    md += `**Anonymization:** ${config.anonymizeAlterNames ? 'Enabled (Names Redacted)' : 'Disabled'}\n\n`;

    if (config.includeFrontDistribution) {
      md += `## 1. Fronting & Consciousness Distribution\n`;
      md += `- **Total Logged Switches:** ${totalSwitches}\n`;
      alters.forEach((a) => {
        const dur = alterDurations[a.id] || 0;
        const hours = (dur / 3600000).toFixed(1);
        const pct = totalTrackedTime > 0 ? Math.round((dur / totalTrackedTime) * 100) : 0;
        md += `- **${getDisplayName(a.id)}**: ${hours} hrs (${pct}%)\n`;
      });
      md += `\n`;
    }

    if (config.includeBodyMetrics) {
      md += `## 2. Body Needs & Somatic Indicators\n`;
      md += `- **Energy Level:** ${bodyNeeds.energyScore} / 10\n`;
      md += `- **Hydration Level:** ${bodyNeeds.hydrationScore} / 10\n`;
      md += `- **Sensory Overload Score:** ${bodyNeeds.sensoryOverloadScore} / 10\n\n`;
    }

    if (config.includeMedications) {
      md += `## 3. Medication & Regimen Compliance\n`;
      meds.forEach((m) => {
        md += `- **${m.name}** (${m.dosage} - ${m.timeOfDay}): ${m.takenToday ? 'Taken' : 'Pending'}\n`;
      });
      md += `\n`;
    }

    if (config.includeTriggers) {
      md += `## 4. Sensory Triggers & Calming Anchors\n`;
      alters.forEach((a) => {
        if (a.sensoryAnchors.positiveTriggers.length > 0 || a.sensoryAnchors.distressTriggers.length > 0) {
          md += `### ${getDisplayName(a.id)}\n`;
          if (a.sensoryAnchors.positiveTriggers.length > 0) {
            md += `- **Grounding Anchors:** ${a.sensoryAnchors.positiveTriggers.join(', ')}\n`;
          }
          if (a.sensoryAnchors.distressTriggers.length > 0) {
            md += `- **Distress Overloads:** ${a.sensoryAnchors.distressTriggers.join(', ')}\n`;
          }
        }
      });
      md += `\n`;
    }

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Controls Banner (Hidden during actual print) */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-1.5">
              <FileText className="w-4 h-4" />
              <span>Therapy & Clinical Integration</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100">
              Clinical Session Report Generator
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              Create structured, privacy-filtered summaries of switching patterns, somatic indicators,
              and grounding triggers for your dissociative disorder specialist or therapist.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Copied Note' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Time Range */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Reporting Period
            </label>
            <div className="flex items-center gap-1.5">
              {[7, 14, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setConfig({ ...config, dateRangeDays: days })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    config.dateRangeDays === days
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Anonymization Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 w-full hover:border-slate-700">
              <input
                type="checkbox"
                checked={config.anonymizeAlterNames}
                onChange={(e) =>
                  setConfig({ ...config, anonymizeAlterNames: e.target.checked })
                }
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Anonymize Alter Names</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Replaces names with "Alter #1 (Role)"
                </span>
              </div>
            </label>
          </div>

          {/* Section Toggles */}
          <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2 md:col-span-1">
            {[
              { key: 'includeFrontDistribution', label: 'Front Stats' },
              { key: 'includeBodyMetrics', label: 'Body Metrics' },
              { key: 'includeMedications', label: 'Meds' },
              { key: 'includeTriggers', label: 'Triggers' },
            ].map((sec) => (
              <button
                key={sec.key}
                onClick={() =>
                  setConfig({
                    ...config,
                    [sec.key]: !config[sec.key as keyof ClinicalReportConfig],
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  config[sec.key as keyof ClinicalReportConfig]
                    ? 'bg-slate-800 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Clinical Report Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl space-y-8 print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 print:text-cyan-700">
              Clinical Session Log & Summary
            </div>
            <h2 className="text-2xl font-bold text-slate-100 print:text-black mt-1">
              {system.name}
            </h2>
            <div className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
              Cooperative System Health & Tracking Summary
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-gray-600 space-y-1">
            <div>
              <span className="font-semibold text-slate-200 print:text-black">Generated: </span>
              {new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div>
              <span className="font-semibold text-slate-200 print:text-black">Coverage: </span>
              Last {config.dateRangeDays} days ({filteredLogs.length} switches recorded)
            </div>
            {config.anonymizeAlterNames && (
              <div className="text-amber-400 print:text-amber-700 font-semibold">
                🔒 Names Anonymized for Privacy
              </div>
            )}
          </div>
        </div>

        {/* 1. Front Distribution & Switches */}
        {config.includeFrontDistribution && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>1. Front Distribution & Switching Frequency</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-2xl">
                <div className="text-[11px] text-slate-400 print:text-gray-600">Total Switches</div>
                <div className="text-xl font-bold text-slate-100 print:text-black mt-0.5">
                  {totalSwitches}
                </div>
              </div>

              <div className="bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-2xl">
                <div className="text-[11px] text-slate-400 print:text-gray-600">Total Active Hours</div>
                <div className="text-xl font-bold text-cyan-400 print:text-cyan-700 mt-0.5">
                  {(totalTrackedTime / 3600000).toFixed(1)} hrs
                </div>
              </div>

              <div className="bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-2xl">
                <div className="text-[11px] text-slate-400 print:text-gray-600">System Identities</div>
                <div className="text-xl font-bold text-slate-100 print:text-black mt-0.5">
                  {alters.length}
                </div>
              </div>

              <div className="bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 p-3.5 rounded-2xl">
                <div className="text-[11px] text-slate-400 print:text-gray-600">Med Compliance</div>
                <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-0.5">
                  {medComplianceRate}%
                </div>
              </div>
            </div>

            {/* Alter Hours Bars */}
            <div className="space-y-2.5 pt-2">
              {alters.map((alter) => {
                const dur = alterDurations[alter.id] || 0;
                const hours = (dur / 3600000).toFixed(1);
                const pct = totalTrackedTime > 0 ? Math.round((dur / totalTrackedTime) * 100) : 0;

                return (
                  <div key={alter.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 print:text-black">
                          {getDisplayName(alter.id)}
                        </span>
                        <span className="text-[10px] text-slate-400 print:text-gray-600">
                          ({alter.roles.join(', ')})
                        </span>
                      </div>
                      <span className="text-slate-300 print:text-gray-700 font-semibold">
                        {hours} hrs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 print:bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: alter.colorHex || '#06b6d4',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Somatic & Body Needs Metrics */}
        {config.includeBodyMetrics && (
          <div className="space-y-4 pt-4 border-t border-slate-800 print:border-gray-300">
            <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>2. Somatic State & Sensory Indicators</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <div className="text-xs text-slate-400 print:text-gray-600 font-medium">
                  Physical Energy
                </div>
                <div className="text-2xl font-black text-amber-400 print:text-amber-700 mt-1">
                  {bodyNeeds.energyScore} / 10
                </div>
                <div className="text-[11px] text-slate-500 print:text-gray-500 mt-1">
                  Average system physical stamina score
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <div className="text-xs text-slate-400 print:text-gray-600 font-medium">
                  Hydration & Nourishment
                </div>
                <div className="text-2xl font-black text-cyan-400 print:text-cyan-700 mt-1">
                  {bodyNeeds.hydrationScore} / 10
                </div>
                <div className="text-[11px] text-slate-500 print:text-gray-500 mt-1">
                  Hydration & regular meal consistency
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <div className="text-xs text-slate-400 print:text-gray-600 font-medium">
                  Sensory Overload Score
                </div>
                <div className="text-2xl font-black text-rose-400 print:text-rose-700 mt-1">
                  {bodyNeeds.sensoryOverloadScore} / 10
                </div>
                <div className="text-[11px] text-slate-500 print:text-gray-500 mt-1">
                  Current nervous system distress load
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Medications Regimen */}
        {config.includeMedications && meds.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800 print:border-gray-300">
            <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>3. Medication Regimen Compliance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100 print:text-black">{med.name}</div>
                    <div className="text-[11px] text-slate-400 print:text-gray-600">
                      {med.dosage} • {med.timeOfDay}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                      med.takenToday
                        ? 'bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800'
                        : 'bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-800'
                    }`}
                  >
                    {med.takenToday ? 'Taken' : 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Sensory Triggers & Anchors Summary */}
        {config.includeTriggers && (
          <div className="space-y-4 pt-4 border-t border-slate-800 print:border-gray-300">
            <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>4. Sensory Anchors & Distress Triggers Catalog</span>
            </h3>

            <div className="space-y-3">
              {alters.map((alter) => {
                if (
                  alter.sensoryAnchors.positiveTriggers.length === 0 &&
                  alter.sensoryAnchors.distressTriggers.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={alter.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 print:bg-gray-100 border border-slate-800 print:border-gray-300 space-y-2 text-xs"
                  >
                    <div className="font-bold text-slate-100 print:text-black flex items-center gap-2">
                      <span>{getDisplayName(alter.id)}</span>
                    </div>

                    {alter.sensoryAnchors.positiveTriggers.length > 0 && (
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-emerald-400 print:text-emerald-800 shrink-0">
                          Calming Anchors:
                        </span>
                        <span className="text-slate-300 print:text-gray-700">
                          {alter.sensoryAnchors.positiveTriggers.join(' • ')}
                        </span>
                      </div>
                    )}

                    {alter.sensoryAnchors.distressTriggers.length > 0 && (
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-rose-400 print:text-rose-800 shrink-0">
                          Sensory Overloads:
                        </span>
                        <span className="text-slate-300 print:text-gray-700">
                          {alter.sensoryAnchors.distressTriggers.join(' • ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Therapist Notes Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-gray-300 text-[11px] text-slate-500 print:text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Generated securely via AlterHaven (100% Local-First Device Storage)</div>
          <div>Clinical Confidential Document</div>
        </div>
      </div>
    </div>
  );
};
