import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Shield, Users } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import type {
  ExternalContact,
  ContactRelationshipType,
  DisclosureLevel,
  AlterComfortLevel,
} from '../../types';

interface AddContactModalProps {
  onClose: () => void;
  contactToEdit?: ExternalContact | null;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  onClose,
  contactToEdit,
}) => {
  const { alters, addContact, updateContact } = useSystemStore();

  const [name, setName] = useState(contactToEdit?.name || '');
  const [relationship, setRelationship] = useState<ContactRelationshipType>(
    contactToEdit?.relationship || 'Friend'
  );
  const [disclosureLevel, setDisclosureLevel] = useState<DisclosureLevel>(
    contactToEdit?.disclosureLevel || 'partially_out'
  );
  const [maskingPersona, setMaskingPersona] = useState(
    contactToEdit?.maskingPersona || ''
  );
  const [phoneOrContact, setPhoneOrContact] = useState(
    contactToEdit?.phoneOrContact || ''
  );
  const [safetyNotes, setSafetyNotes] = useState(
    contactToEdit?.safetyNotes || ''
  );
  const [avatarColor, setAvatarColor] = useState(
    contactToEdit?.avatarColor || '#6366f1'
  );

  const [alterRelMap, setAlterRelMap] = useState<
    Record<
      string,
      { comfortLevel: AlterComfortLevel; isOutTo: boolean; notes?: string }
    >
  >(() => {
    if (contactToEdit?.alterRelationships) {
      return { ...contactToEdit.alterRelationships };
    }
    const initial: Record<
      string,
      { comfortLevel: AlterComfortLevel; isOutTo: boolean; notes?: string }
    > = {};
    alters.forEach((a) => {
      initial[a.id] = {
        comfortLevel: 'comfortable',
        isOutTo: disclosureLevel === 'fully_out',
        notes: '',
      };
    });
    return initial;
  });

  const handleAlterComfortChange = (
    alterId: string,
    comfortLevel: AlterComfortLevel
  ) => {
    setAlterRelMap((prev) => ({
      ...prev,
      [alterId]: {
        ...(prev[alterId] || {
          comfortLevel: 'comfortable',
          isOutTo: false,
        }),
        comfortLevel,
      },
    }));
  };

  const handleAlterOutToggle = (alterId: string, isOutTo: boolean) => {
    setAlterRelMap((prev) => ({
      ...prev,
      [alterId]: {
        ...(prev[alterId] || {
          comfortLevel: 'comfortable',
          isOutTo: false,
        }),
        isOutTo,
      },
    }));
  };

  const handleAlterNotesChange = (alterId: string, notes: string) => {
    setAlterRelMap((prev) => ({
      ...prev,
      [alterId]: {
        ...(prev[alterId] || {
          comfortLevel: 'comfortable',
          isOutTo: false,
        }),
        notes,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedRelationships: Record<string, any> = {};
    alters.forEach((a) => {
      formattedRelationships[a.id] = {
        alterId: a.id,
        comfortLevel: alterRelMap[a.id]?.comfortLevel || 'neutral',
        isOutTo:
          disclosureLevel === 'fully_out'
            ? true
            : disclosureLevel === 'covert_only'
            ? false
            : alterRelMap[a.id]?.isOutTo ?? false,
        notes: alterRelMap[a.id]?.notes?.trim() || undefined,
      };
    });

    if (contactToEdit) {
      updateContact(contactToEdit.id, {
        name: name.trim(),
        relationship,
        disclosureLevel,
        maskingPersona: maskingPersona.trim() || undefined,
        phoneOrContact: phoneOrContact.trim() || undefined,
        safetyNotes: safetyNotes.trim() || undefined,
        avatarColor,
        alterRelationships: formattedRelationships,
      });
    } else {
      addContact({
        systemId: 'sys_1',
        name: name.trim(),
        relationship,
        disclosureLevel,
        maskingPersona: maskingPersona.trim() || undefined,
        phoneOrContact: phoneOrContact.trim() || undefined,
        safetyNotes: safetyNotes.trim() || undefined,
        avatarColor,
        alterRelationships: formattedRelationships,
      });
    }

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {contactToEdit ? 'Edit Contact & Masking Rules' : 'Add External Contact'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure disclosure levels, masking personas, and alter boundaries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Vance, Sarah, Coworker Mark"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Relationship Type
              </label>
              <select
                value={relationship}
                onChange={(e) =>
                  setRelationship(e.target.value as ContactRelationshipType)
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="Friend">Friend</option>
                <option value="Partner">Partner</option>
                <option value="Family">Family</option>
                <option value="Therapist / Medical">Therapist / Medical</option>
                <option value="Coworker">Coworker / Boss</option>
                <option value="Acquaintance">Acquaintance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              System Disclosure Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDisclosureLevel('fully_out')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 ${
                  disclosureLevel === 'fully_out'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🟢 Fully Out</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Knows all alters & plural system
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDisclosureLevel('partially_out')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 ${
                  disclosureLevel === 'partially_out'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🟡 Partially Out</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Knows select alters only
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDisclosureLevel('covert_only')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 ${
                  disclosureLevel === 'covert_only'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔴 Covert Only</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Must strictly mask as singleton/host
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Masking Persona & Front Guidance
            </label>
            <textarea
              value={maskingPersona}
              onChange={(e) => setMaskingPersona(e.target.value)}
              rows={2}
              placeholder="e.g., Act strictly as Alex (Host). Keep topics on engineering sprint tickets and light small talk..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Info / Phone
              </label>
              <input
                type="text"
                value={phoneOrContact}
                onChange={(e) => setPhoneOrContact(e.target.value)}
                placeholder="e.g., (555) 382-9104, Slack @username"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Safety & Boundary Notes
              </label>
              <input
                type="text"
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                placeholder="e.g., Safe co-regulation anchor, or avoid conflict"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Per-Alter Comfort Matrix */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Per-Alter Comfort & Boundary Matrix
            </label>

            <div className="space-y-2">
              {alters.map((alter) => {
                const rel = alterRelMap[alter.id] || {
                  comfortLevel: 'comfortable',
                  isOutTo: false,
                  notes: '',
                };

                return (
                  <div
                    key={alter.id}
                    className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: alter.colorHex }}
                        />
                        <span className="font-bold text-xs text-slate-200">
                          {alter.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {disclosureLevel === 'partially_out' && (
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rel.isOutTo}
                              onChange={(e) =>
                                handleAlterOutToggle(alter.id, e.target.checked)
                              }
                              className="w-3.5 h-3.5 rounded text-teal-500 bg-slate-900 border-slate-700"
                            />
                            <span>Out to {name || 'them'}</span>
                          </label>
                        )}

                        <select
                          value={rel.comfortLevel}
                          onChange={(e) =>
                            handleAlterComfortChange(
                              alter.id,
                              e.target.value as AlterComfortLevel
                            )
                          }
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                        >
                          <option value="comfortable">🟢 Comfortable</option>
                          <option value="neutral">⚪ Neutral</option>
                          <option value="cautious">🟡 Cautious</option>
                          <option value="avoid">🔴 Avoid</option>
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={`Notes for ${alter.name} regarding ${name || 'contact'}...`}
                      value={rel.notes || ''}
                      onChange={(e) =>
                        handleAlterNotesChange(alter.id, e.target.value)
                      }
                      className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 rounded-xl shadow-lg shadow-teal-500/20"
            >
              {contactToEdit ? 'Save Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
