import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { Alter, AlterRole } from '../../types';
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  Radio,
  Edit2,
  Trash2,
  CheckCircle2,
  Activity,
  Heart,
} from 'lucide-react';
import { AlterModal } from './AlterModal';

export const AlterDirectory: React.FC = () => {
  const { alters, activeFronts, setFront, deleteAlter } = useSystemStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlter, setEditingAlter] = useState<Alter | null>(null);

  // Vault Unlock State in memory for current session
  const [unlockedVaults, setUnlockedVaults] = useState<Record<string, boolean>>({});
  const [pinPromptAlterId, setPinPromptAlterId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const safeAlters = Array.isArray(alters) ? alters : [];

  const filteredAlters = safeAlters.filter((alter) => {
    if (!alter || !alter.name) return false;
    const q = (searchQuery || '').toLowerCase();
    const nameMatches = (alter.name || '').toLowerCase().includes(q);
    const pronounsMatches = Array.isArray(alter.pronouns) &&
      alter.pronouns.some((p) => p && p.toLowerCase().includes(q));
    const descMatches = alter.description && alter.description.toLowerCase().includes(q);

    const matchesSearch = !q || nameMatches || pronounsMatches || descMatches;

    const matchesRole =
      selectedRoleFilter === 'all' ||
      (Array.isArray(alter.roles) && alter.roles.includes(selectedRoleFilter as AlterRole));

    return matchesSearch && matchesRole;
  });

  const handleOpenAddModal = () => {
    setEditingAlter(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (alter: Alter) => {
    setEditingAlter(alter);
    setIsModalOpen(true);
  };

  const handleUnlockVault = (alter: Alter) => {
    if (enteredPin === alter.pinCode) {
      setUnlockedVaults((prev) => ({ ...prev, [alter.id]: true }));
      setPinPromptAlterId(null);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN code.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Alters & System Members</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage member profiles, sensory anchors, positive triggers, and private vaults.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Alter</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alters by name, pronouns, or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles ({safeAlters.length})</option>
          <option value="Host">Host</option>
          <option value="Protector">Protector</option>
          <option value="Caretaker">Caretaker</option>
          <option value="Gatekeeper">Gatekeeper</option>
          <option value="Little">Little</option>
          <option value="Internal Self Helper (ISH)">ISH</option>
          <option value="Memory Holder">Memory Holder</option>
        </select>
      </div>

      {/* Alters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAlters.map((alter) => {
          const isFronting = activeFronts.some((f) => f.alterId === alter.id && f.status === 'front');
          const isCoFronting = activeFronts.some((f) => f.alterId === alter.id && f.status !== 'front');
          const isVaultUnlocked = unlockedVaults[alter.id] || !alter.isVaultLocked;
          const pronounsText = Array.isArray(alter.pronouns) ? alter.pronouns.join('/') : 'they/them';
          const alterRoles = Array.isArray(alter.roles) ? alter.roles : ['Host'];

          return (
            <div
              key={alter.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden group shadow-lg"
              style={{
                borderTop: `4px solid ${alter.colorHex || '#6366f1'}`,
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-inner relative overflow-hidden ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: alter.colorHex || '#6366f1' }}
                    >
                      {alter.avatarUrl ? (
                        <img src={alter.avatarUrl} alt={alter.name} className="w-full h-full object-cover" />
                      ) : (
                        alter.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-100">{alter.name}</h3>
                        {alter.ageAppearance && (
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                            age {alter.ageAppearance}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {pronounsText}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(alter)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Edit Alter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {safeAlters.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete profile for ${alter.name}?`)) {
                            deleteAlter(alter.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Alter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {isFronting && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Primary Front
                    </span>
                  )}
                  {isCoFronting && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Co-Conscious
                    </span>
                  )}
                  {alterRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80"
                    >
                      {role}
                    </span>
                  ))}
                  {alter.allowExternalBroadcast && (
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-indigo-300 border border-slate-700"
                      title="External switch broadcast enabled"
                    >
                      <Radio className="w-2.5 h-2.5 inline mr-1" />
                      Sync
                    </span>
                  )}
                </div>

                {/* Description */}
                {alter.description && (
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                    {alter.description}
                  </p>
                )}

                {/* Vault Locked view */}
                {!isVaultUnlocked ? (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between my-3">
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Vault Locked (PIN required)</span>
                    </div>
                    <button
                      onClick={() => setPinPromptAlterId(alter.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                    >
                      Unlock
                    </button>
                  </div>
                ) : (
                  /* Sensory Anchors Accordion/Box */
                  <div className="space-y-2 my-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px]">
                    {alter.sensoryAnchors?.positiveTriggers && alter.sensoryAnchors.positiveTriggers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Positive Grounding Anchors:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {alter.sensoryAnchors.positiveTriggers.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {alter.sensoryAnchors?.distressTriggers && alter.sensoryAnchors.distressTriggers.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1">
                          <Shield className="w-3 h-3" />
                          <span>Sensory Distresses to Avoid:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {alter.sensoryAnchors.distressTriggers.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Switch Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isFronting ? 'Currently in control' : 'Set consciousness state'}
                </span>
                {!isFronting && (
                  <button
                    onClick={() => setFront(alter.id, 'front')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Switch Front</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PIN Unlock Modal */}
      {pinPromptAlterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Unlock Private Vault</span>
            </div>
            <p className="text-xs text-slate-400">
              Enter the private PIN code configured for this alter's space.
            </p>
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setPinPromptAlterId(null);
                  setEnteredPin('');
                  setPinError('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = safeAlters.find((a) => a.id === pinPromptAlterId);
                  if (target) handleUnlockVault(target);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alter Create / Edit Modal */}
      {isModalOpen && (
        <AlterModal
          key={editingAlter ? editingAlter.id : 'new_alter_modal'}
          alter={editingAlter}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
