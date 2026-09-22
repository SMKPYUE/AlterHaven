import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import { GroundingPlaylist, MusicPlatform } from '../../types';
import { SoundEngine } from '../../utils/soundEffects';
import {
  HeartPulse,
  Droplets,
  Zap,
  Utensils,
  Pill,
  Sparkles,
  Wind,
  CheckCircle2,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Music,
  ExternalLink,
  Headphones,
  Radio,
  X,
  Volume2,
  Clock,
} from 'lucide-react';

export const BodyCareView: React.FC = () => {
  const {
    bodyNeeds,
    updateBodyNeeds,
    addMedication,
    deleteMedication,
    toggleMedicationTaken,
    resetDailyTrackers,
    activeFronts,
    alters,
    playlists,
    addPlaylist,
    deletePlaylist,
    devicePrefs,
  } = useSystemStore();

  const mainFrontAlter = alters.find((a) => a.id === activeFronts.find((f) => f.status === 'front')?.alterId);

  // Breathing Guide State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCountdown, setBreathingCountdown] = useState(4);

  // 5-4-3-2-1 Grounding State
  const [activeGroundingStep, setActiveGroundingStep] = useState(0);

  // Active Embedded Playlist Player Modal
  const [activeEmbedPlaylist, setActiveEmbedPlaylist] = useState<GroundingPlaylist | null>(null);

  // Add Playlist Modal State
  const [isAddPlaylistOpen, setIsAddPlaylistOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<MusicPlatform>('youtube');
  const [newUrl, setNewUrl] = useState('');
  const [newCustomAlterId, setNewCustomAlterId] = useState<string>('');
  const [newTags, setNewTags] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Add Medication Modal State
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTimeOfDay, setMedTimeOfDay] = useState('Morning');

  // Breathing timer cycle (4-4-4-4 Box Breathing) with sound chime
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCountdown((prev) => {
          if (prev <= 1) {
            setBreathingPhase((current) => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') {
                if (devicePrefs.soundEnabled) {
                  SoundEngine.playBreathingChime(devicePrefs.soundVolume);
                }
                return 'Rest';
              }
              if (devicePrefs.soundEnabled) {
                SoundEngine.playBreathingChime(devicePrefs.soundVolume);
              }
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, devicePrefs]);

  const handleLogGlassOfWater = () => {
    if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
    const newHydration = Math.min(bodyNeeds.hydrationScore + 2, 10);
    updateBodyNeeds({
      hydrationScore: newHydration,
      lastWaterTime: Date.now(),
      updatedByAlterId: mainFrontAlter?.id,
    });
  };

  const handleLogMeal = () => {
    if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
    updateBodyNeeds({
      lastMealTime: Date.now(),
      updatedByAlterId: mainFrontAlter?.id,
    });
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let embedUrl = '';
    if (newUrl.includes('youtube.com/watch?v=')) {
      const videoId = newUrl.split('v=')[1]?.split('&')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (newUrl.includes('youtu.be/')) {
      const videoId = newUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (newUrl.includes('spotify.com/')) {
      embedUrl = newUrl.replace('spotify.com/', 'spotify.com/embed/');
    }

    addPlaylist({
      systemId: 'sys_1',
      title: newTitle.trim(),
      platform: newPlatform,
      url: newUrl.trim(),
      embedUrl: embedUrl || undefined,
      customAlterId: newCustomAlterId || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      description: newDesc.trim() || undefined,
    });

    setNewTitle('');
    setNewUrl('');
    setNewTags('');
    setNewDesc('');
    setIsAddPlaylistOpen(false);
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    addMedication({
      name: medName.trim(),
      dosage: medDosage.trim() || 'As directed',
      timeOfDay: medTimeOfDay.trim() || 'Daily',
    });

    setMedName('');
    setMedDosage('');
    setMedTimeOfDay('Morning');
    setIsAddMedOpen(false);
  };

  const groundingStepsConfig = [
    { count: 5, prompt: '5 things you can SEE around the room', color: 'text-sky-400' },
    { count: 4, prompt: '4 things you can physically TOUCH or feel', color: 'text-emerald-400' },
    { count: 3, prompt: '3 distinct sounds you can HEAR', color: 'text-amber-400' },
    { count: 2, prompt: '2 things you can SMELL (or favourite scents)', color: 'text-pink-400' },
    { count: 1, prompt: '1 positive grounding affirmation or truth about yourself', color: 'text-indigo-400' },
  ];

  const safeMeds = Array.isArray(bodyNeeds.medications) ? bodyNeeds.medications : [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-400" />
          <span>Shared Body Care & Grounding Toolkit</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitor shared biological needs, medication logs, and instant sensory grounding playlists.
        </p>
      </div>

      {/* Body Needs Sliders & Quick Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Energy */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Zap className="w-4 h-4" />
              <span>Physical Energy Score</span>
            </div>
            <span className="font-bold text-amber-400 font-mono text-sm">
              {bodyNeeds.energyScore}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={bodyNeeds.energyScore}
            onChange={(e) => updateBodyNeeds({ energyScore: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>1 (Exhausted)</span>
            <span>5 (Moderate)</span>
            <span>10 (Energized)</span>
          </div>
        </div>

        {/* Hydration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
              <Droplets className="w-4 h-4" />
              <span>Hydration Level</span>
            </div>
            <span className="font-bold text-sky-400 font-mono text-sm">
              {bodyNeeds.hydrationScore}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={bodyNeeds.hydrationScore}
            onChange={(e) => updateBodyNeeds({ hydrationScore: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleLogGlassOfWater}
              className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Glass Water</span>
            </button>
            <span className="text-[10px] text-slate-500">
              {bodyNeeds.lastWaterTime
                ? `Last drink ${Math.round((Date.now() - bodyNeeds.lastWaterTime) / 60000)}m ago`
                : ''}
            </span>
          </div>
        </div>

        {/* Sensory Overload */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Sensory Load / Overwhelm</span>
            </div>
            <span className="font-bold text-indigo-400 font-mono text-sm">
              {bodyNeeds.sensoryOverloadScore}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={bodyNeeds.sensoryOverloadScore}
            onChange={(e) => updateBodyNeeds({ sensoryOverloadScore: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleLogMeal}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Log Meal Taken</span>
            </button>
            <span className="text-[10px] text-slate-500">
              {bodyNeeds.lastMealTime
                ? `Meal ${Math.round((Date.now() - bodyNeeds.lastMealTime) / 3600000)}h ago`
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Medication Log Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Pill className="w-4 h-4 text-rose-400" />
              <span>Daily Medication & Supplement Schedule</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any medication card to toggle taken status. Keep the physical body consistently cared for.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-slate-400 font-medium">
              {safeMeds.filter((m) => m.takenToday).length} of {safeMeds.length} taken today
            </span>
            <button
              onClick={() => {
                if (confirm("Reset today's medication checks for a fresh day?")) {
                  resetDailyTrackers();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 text-xs font-semibold border border-slate-700 transition-all"
              title="Reset all taken checks for today (auto-resets daily at midnight)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset for New Day</span>
            </button>
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {safeMeds.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400 space-y-2">
            <Pill className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs">No medications added yet.</p>
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Add your first prescription or vitamin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeMeds.map((med) => {
              const takenBy = alters.find((a) => a.id === med.takenByAlterId);

              return (
                <div
                  key={med.id}
                  onClick={() => {
                    if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
                    toggleMedicationTaken(med.id, mainFrontAlter?.id || (alters[0]?.id || 'alt_1'));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 group relative ${
                    med.takenToday
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className="truncate">{med.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 shrink-0">
                        {med.timeOfDay}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{med.dosage}</p>
                    {med.takenToday && (
                      <p className="text-[10px] text-emerald-400 mt-2 font-medium">
                        ✓ Taken {takenBy ? `by ${takenBy.name}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMedication(med.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded hover:bg-slate-800"
                      title="Remove this medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        med.takenToday
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700'
                      }`}
                    >
                      {med.takenToday && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grounding Playlists & Audio Sanctuary */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Music className="w-4 h-4 text-emerald-400" />
              <span>Grounding Audio & Alter Playlists</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quick 1-tap sensory anchors and calming YouTube/Spotify playlists tailored for switches.
            </p>
          </div>

          <button
            onClick={() => setIsAddPlaylistOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Audio Anchor</span>
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const linkedAlter = pl.customAlterId ? alters.find((a) => a.id === pl.customAlterId) : null;

            return (
              <div
                key={pl.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        pl.platform === 'spotify'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-red-950/60 text-red-300 border-red-800/60'
                      }`}
                    >
                      {pl.platform}
                    </span>

                    <button
                      onClick={() => deletePlaylist(pl.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{pl.title}</h4>
                  {pl.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {pl.description}
                    </p>
                  )}

                  {/* Alter Attribution & Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {linkedAlter && (
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-white flex items-center gap-1"
                        style={{ backgroundColor: linkedAlter.colorHex + 'cc' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {linkedAlter.name}
                      </span>
                    )}
                    {pl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions (Play Embed vs Open Link) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  {pl.embedUrl ? (
                    <button
                      onClick={() => setActiveEmbedPlaylist(pl)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play In-App</span>
                    </button>
                  ) : (
                    <a
                      href={pl.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link</span>
                    </a>
                  )}

                  <a
                    href={pl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <span>External</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounding Utilities (Breathing & 5-4-3-2-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box Breathing Guide */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>4-4-4-4 Box Breathing Sanctuary</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calm the nervous system and anchor into the physical body with audio chime guidance.
            </p>
          </div>

          <div className="my-8 relative flex items-center justify-center">
            {/* Animated breathing pulse ring */}
            <div
              className={`w-44 h-44 rounded-full border-4 border-indigo-500/40 flex items-center justify-center transition-all duration-1000 ${
                isBreathingActive && breathingPhase === 'Inhale'
                  ? 'scale-125 bg-indigo-500/20 border-indigo-400 shadow-2xl shadow-indigo-500/30'
                  : isBreathingActive && breathingPhase === 'Exhale'
                  ? 'scale-90 bg-sky-500/10 border-sky-400'
                  : 'scale-100 bg-slate-950/60'
              }`}
            >
              <div className="text-center space-y-1">
                <span className="text-sm font-bold text-indigo-200 block uppercase tracking-wider">
                  {isBreathingActive ? breathingPhase : 'Ready'}
                </span>
                <span className="text-3xl font-extrabold text-white font-mono block">
                  {isBreathingActive ? breathingCountdown : '4s'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
                setIsBreathingActive(!isBreathingActive);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isBreathingActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isBreathingActive ? 'Pause Breathing' : 'Start 4-4-4-4 Guide'}</span>
            </button>
          </div>
        </div>

        {/* 5-4-3-2-1 Sensory Grounding Tool */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>5-4-3-2-1 Grounding Countdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Focus awareness on the immediate environment during dissociation.
            </p>
          </div>

          <div className="space-y-3">
            {groundingStepsConfig.map((step, idx) => {
              const isCurrent = activeGroundingStep === idx;

              return (
                <div
                  key={step.count}
                  onClick={() => {
                    if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
                    setActiveGroundingStep(idx);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={step.color}>
                      {step.count} — {step.prompt}
                    </span>
                    <span className="text-[10px] text-slate-500">Step {idx + 1} of 5</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Notice out loud or in your mind 5 distinct anchors to settle in the present moment.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* In-App Embed Player Modal */}
      {activeEmbedPlaylist && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveEmbedPlaylist(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-100 truncate">{activeEmbedPlaylist.title}</h3>
              </div>
              <button
                onClick={() => setActiveEmbedPlaylist(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={activeEmbedPlaylist.embedUrl}
                title={activeEmbedPlaylist.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Medication Modal */}
      {isAddMedOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddMedOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-semibold text-slate-100">Add Medication / Supplement</h3>
              </div>
              <button
                onClick={() => setIsAddMedOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Medication / Vitamin Name *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Sertraline, Vitamin D3, Melatonin"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dosage / Instructions
                </label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="e.g. 50mg with water, 1000 IU, 1 tablet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Time of Day / Routine</span>
                </label>
                <select
                  value={medTimeOfDay}
                  onChange={(e) => setMedTimeOfDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Morning">Morning / Breakfast</option>
                  <option value="Noon">Noon / Lunch</option>
                  <option value="Evening">Evening / Dinner</option>
                  <option value="Bedtime">Bedtime / Night</option>
                  <option value="As Needed">As Needed / PRN</option>
                  <option value="Twice Daily">Twice Daily</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Audio Anchor Modal */}
      {isAddPlaylistOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddPlaylistOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">Add Grounding Audio Sanctuary</h3>
              </div>
              <button
                onClick={() => setIsAddPlaylistOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Playlist Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Maya's Calming Peppermint Rain, 432Hz Calm"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="youtube">YouTube (Embeddable)</option>
                    <option value="spotify">Spotify</option>
                    <option value="apple_music">Apple Music</option>
                    <option value="ambient">Ambient Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alter Anchor</label>
                  <select
                    value={newCustomAlterId}
                    onChange={(e) => setNewCustomAlterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Shared System</option>
                    {alters.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL (YouTube Video or Spotify Link) *</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or Spotify URL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Lo-Fi, Rain, 432Hz, Lullaby"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPlaylistOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow"
                >
                  Save Audio Anchor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
