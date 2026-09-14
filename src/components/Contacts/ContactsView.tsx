import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Phone,
  HelpCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { AddContactModal } from './AddContactModal';
import type { DisclosureLevel, ExternalContact } from '../../types';

export const ContactsView: React.FC = () => {
  const { contacts, alters, activeFronts, deleteContact } = useSystemStore();

  const [selectedDisclosure, setSelectedDisclosure] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ExternalContact | null>(null);

  const currentFrontAlterId =
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';
  const currentFrontAlter = alters.find((a) => a.id === currentFrontAlterId);

  const filteredContacts = contacts.filter((contact) => {
    if (selectedDisclosure === 'all') return true;
    return contact.disclosureLevel === selectedDisclosure;
  });

  const getDisclosureBadge = (level: DisclosureLevel) => {
    switch (level) {
      case 'fully_out':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <UserCheck className="w-3 h-3" />
            <span>Fully Out</span>
          </span>
        );
      case 'partially_out':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            <span>Partially Out</span>
          </span>
        );
      case 'covert_only':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <EyeOff className="w-3 h-3" />
            <span>Covert / Strict Mask</span>
          </span>
        );
    }
  };

  const getComfortBadge = (comfort: string) => {
    switch (comfort) {
      case 'comfortable':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'neutral':
        return 'text-slate-300 bg-slate-800/60 border-slate-700';
      case 'cautious':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'avoid':
        return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/40 border border-teal-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold tracking-wider uppercase mb-2">
              <Users className="w-4 h-4" />
              <span>External People & Masking Directory</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
              Contacts & Masking Matrix
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track who in the outside world knows about the system, designated fronting personas,
              and per-alter comfort boundaries to prevent accidental disclosure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setContactToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Current Front Notice Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Current Front:</span>
            <span
              className="px-2 py-0.5 rounded-md font-bold text-white shadow-sm"
              style={{ backgroundColor: currentFrontAlter?.colorHex || '#6366f1' }}
            >
              {currentFrontAlter?.name || 'Active Front'}
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Check each contact card below to see if {currentFrontAlter?.name} is out or should mask.
          </div>
        </div>
      </div>

      {/* Disclosure Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Contacts', count: contacts.length },
          {
            id: 'fully_out',
            label: '🟢 Fully Out',
            count: contacts.filter((c) => c.disclosureLevel === 'fully_out').length,
          },
          {
            id: 'partially_out',
            label: '🟡 Partially Out',
            count: contacts.filter((c) => c.disclosureLevel === 'partially_out').length,
          },
          {
            id: 'covert_only',
            label: '🔴 Covert / Masking',
            count: contacts.filter((c) => c.disclosureLevel === 'covert_only').length,
          },
        ].map((tab) => {
          const isActive = selectedDisclosure === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedDisclosure(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredContacts.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center col-span-full">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No contacts in this category.</p>
            <button
              onClick={() => {
                setContactToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-xl hover:bg-teal-500/30"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const myRel = contact.alterRelationships
              ? contact.alterRelationships[currentFrontAlterId]
              : undefined;

            return (
              <div
                key={contact.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-md"
                        style={{ backgroundColor: contact.avatarColor || '#14b8a6' }}
                      >
                        {contact.name.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{contact.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {contact.relationship}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setContactToEdit(contact);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete contact "${contact.name}"?`)) {
                            deleteContact(contact.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Disclosure Status & Contact Details */}
                  <div className="flex flex-wrap items-center gap-2 mt-3.5">
                    {getDisclosureBadge(contact.disclosureLevel)}
                    {contact.phoneOrContact && (
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[200px]">{contact.phoneOrContact}</span>
                      </span>
                    )}
                  </div>

                  {/* Active Front Alter Quick Status Callout */}
                  <div
                    className={`mt-3.5 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      contact.disclosureLevel === 'fully_out' || myRel?.isOutTo
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {contact.disclosureLevel === 'fully_out' || myRel?.isOutTo ? (
                        <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">
                          {currentFrontAlter?.name || 'Active Front'}:{' '}
                        </span>
                        <span>
                          {contact.disclosureLevel === 'fully_out' || myRel?.isOutTo
                            ? 'They are aware of this identity'
                            : 'They DO NOT know this identity (Mask required)'}
                        </span>
                      </div>
                    </div>
                    {myRel?.comfortLevel && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${getComfortBadge(
                          myRel.comfortLevel
                        )}`}
                      >
                        {myRel.comfortLevel}
                      </span>
                    )}
                  </div>

                  {/* Masking Persona Box */}
                  {contact.maskingPersona && (
                    <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Masking Instructions & Persona:</span>
                      </div>
                      <p className="text-slate-300 italic">{contact.maskingPersona}</p>
                    </div>
                  )}

                  {/* Safety Notes */}
                  {contact.safetyNotes && (
                    <div className="mt-2.5 text-xs text-slate-400 flex items-baseline gap-1.5">
                      <span className="font-semibold text-slate-300">Safety Notes:</span>
                      <span>{contact.safetyNotes}</span>
                    </div>
                  )}
                </div>

                {/* Alter Comfort Matrix Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Alter Comfort & Knowledge Matrix
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alters.map((alter) => {
                      const rel = contact.alterRelationships
                        ? contact.alterRelationships[alter.id]
                        : undefined;
                      const isOut = contact.disclosureLevel === 'fully_out' || rel?.isOutTo;
                      const comfort = rel?.comfortLevel || 'neutral';

                      return (
                        <div
                          key={alter.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${getComfortBadge(
                            comfort
                          )}`}
                          title={`${alter.name}: ${comfort} • ${
                            isOut ? 'Out' : 'Not out'
                          }${rel?.notes ? ` • "${rel.notes}"` : ''}`}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: alter.colorHex }}
                          />
                          <span className="font-medium text-slate-200">{alter.name}</span>
                          <span className="text-[10px] font-bold opacity-80">
                            {isOut ? '✓' : '🔒'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddContactModal
          contactToEdit={contactToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setContactToEdit(null);
          }}
        />
      )}
    </div>
  );
};
