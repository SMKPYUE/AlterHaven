import { create } from 'zustand';
import type {
  System,
  Alter,
  FrontMember,
  FrontLog,
  Board,
  BoardWidget,
  Task,
  TaskNegotiationStatus,
  Channel,
  InnerMessage,
  BodyNeedsMeter,
  SwitchWebhookConfig,
  GroundingPlaylist,
  DevicePreferences,
  SystemRule,
  SystemPoll,
  ExternalContact,
  AlterComfortLevel,
  MedicationRecord,
} from '../types';
import { dispatchSwitchWebhook } from '../utils/webhookDispatcher';
import { SoundEngine } from '../utils/soundEffects';


export interface SystemState {
  // System Profile
  system: System;
  updateSystem: (updates: Partial<System>) => void;

  // Alters
  alters: Alter[];
  addAlter: (alter: Omit<Alter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlter: (id: string, updates: Partial<Alter>) => void;
  deleteAlter: (id: string) => void;

  // Fronting & Active Identities
  activeFronts: FrontMember[];
  frontLogs: FrontLog[];
  setFront: (alterId: string, status: 'front' | 'co-front' | 'co-conscious', note?: string, energy?: number) => void;
  removeFromFront: (alterId: string) => void;
  clearFronts: () => void;

  // Corkboard & Widgets
  activeBoardId: string;
  boards: Board[];
  widgets: BoardWidget[];
  setActiveBoardId: (boardId: string) => void;
  addBoard: (board: Omit<Board, 'id' | 'createdAt'>) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  addWidget: (widget: Omit<BoardWidget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWidget: (id: string, updates: Partial<BoardWidget>) => void;
  deleteWidget: (id: string) => void;

  // Tasks & Missions Delegation
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'handoffHistory'>) => void;
  updateTaskStatus: (
    taskId: string,
    status: TaskNegotiationStatus,
    alterId: string,
    notes?: string,
    suggestedReassignmentAlterId?: string
  ) => void;
  deleteTask: (id: string) => void;

  // Inner Messaging / Channels
  activeChannelId: string;
  channels: Channel[];
  messages: InnerMessage[];
  setActiveChannelId: (id: string) => void;
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt'>) => void;
  sendMessage: (channelId: string, senderAlterId: string, content: string, audioUrl?: string, audioDurationSec?: number) => void;
  pinMessageToBoard: (messageId: string, boardId: string) => void;

  // Body Care, Grounding & Audio Playlists
  bodyNeeds: BodyNeedsMeter;
  updateBodyNeeds: (updates: Partial<BodyNeedsMeter>) => void;
  addMedication: (med: Omit<MedicationRecord, 'id' | 'takenToday' | 'lastTakenAt' | 'takenByAlterId'>) => void;
  deleteMedication: (medId: string) => void;
  toggleMedicationTaken: (medId: string, alterId: string) => void;
  playlists: GroundingPlaylist[];
  addPlaylist: (playlist: Omit<GroundingPlaylist, 'id' | 'createdAt'>) => void;
  deletePlaylist: (id: string) => void;

  // Device & Audio Preferences (Local Per-Device)
  devicePrefs: DevicePreferences;
  updateDevicePrefs: (updates: Partial<DevicePreferences>) => void;

  // Webhook Integrations
  webhooks: SwitchWebhookConfig[];
  addWebhook: (webhook: Omit<SwitchWebhookConfig, 'id'>) => void;
  updateWebhook: (id: string, updates: Partial<SwitchWebhookConfig>) => void;
  deleteWebhook: (id: string) => void;
  triggerWebhookTest: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 2. System Codex & Agreements
  rules: SystemRule[];
  addRule: (rule: Omit<SystemRule, 'id' | 'createdAt' | 'updatedAt' | 'acknowledgements'>) => void;
  updateRule: (id: string, updates: Partial<SystemRule>) => void;
  deleteRule: (id: string) => void;
  acknowledgeRule: (ruleId: string, alterId: string, comment?: string) => void;

  // 3. Internal Consensus & Polls Engine
  polls: SystemPoll[];
  createPoll: (poll: Omit<SystemPoll, 'id' | 'createdAt' | 'updatedAt' | 'votes'>) => void;
  castVote: (pollId: string, alterId: string, optionId: string, comment?: string, isVeto?: boolean) => void;
  resolvePoll: (pollId: string, resolvedOptionId?: string) => void;
  deletePoll: (id: string) => void;

  // 4. External Contacts & Masking Matrix
  contacts: ExternalContact[];
  addContact: (contact: Omit<ExternalContact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<ExternalContact>) => void;
  deleteContact: (id: string) => void;
  updateAlterContactComfort: (contactId: string, alterId: string, comfort: AlterComfortLevel, isOutTo: boolean, notes?: string) => void;

  // QR / Offline Sync Engine
  isQrSyncModalOpen: boolean;
  openQrSyncModal: () => void;
  closeQrSyncModal: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => boolean;

  // Switch-In Handoff Briefing
  isBriefingModalOpen: boolean;
  briefingAlterId: string | null;
  openBriefingModal: (alterId: string) => void;
  closeBriefingModal: () => void;

  // Reset & Factory Defaults
  resetToDefaultData: () => void;
}


const STORAGE_KEY = 'alterhaven_data_v1';
const LEGACY_STORAGE_KEY = 'systemboard_data_v1';

const initialSystem: System = {
  id: 'sys_1',
  name: 'The Kaleidoscope System',
  tagline: 'Cooperative internal harmony & shared living',
  avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
  createdAt: Date.now() - 30 * 86400000,
  updatedAt: Date.now(),
};

const initialAlters: Alter[] = [
  {
    id: 'alt_1',
    systemId: 'sys_1',
    name: 'Alex',
    pronouns: ['he', 'they'],
    colorHex: '#6366f1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    roles: ['Host', 'Academic / Work'],
    ageAppearance: '24',
    description: 'Main day host, manages study, project schedules, and external emails.',
    sensoryAnchors: {
      positiveTriggers: ['Lavender tea', 'Warm fleece hoodie', 'Lo-fi chillhop beats', 'Noise-cancelling headphones'],
      distressTriggers: ['Unexpected high-pitch alarms', 'Sensory overload in grocery stores'],
    },
    isVaultLocked: false,
    allowExternalBroadcast: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'alt_2',
    systemId: 'sys_1',
    name: 'Maya',
    pronouns: ['she', 'her'],
    colorHex: '#ec4899',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    roles: ['Protector', 'Caretaker'],
    ageAppearance: '26',
    description: 'Grounding anchor and protector. Handles doctor calls, boundaries, and conflict resolution.',
    sensoryAnchors: {
      positiveTriggers: ['Peppermint oil', 'Weighted blanket (15lb)', 'Cold water on wrists', 'Crisp outdoor air'],
      distressTriggers: ['Crowded enclosed spaces', 'Aggressive tone of voice'],
    },
    isVaultLocked: false,
    allowExternalBroadcast: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'alt_3',
    systemId: 'sys_1',
    name: 'Leo',
    pronouns: ['he', 'him'],
    colorHex: '#eab308',
    avatarUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
    roles: ['Little'],
    ageAppearance: '7-8',
    description: 'Loves plushies, coloring books, fruit snacks, and animal documentaries.',
    sensoryAnchors: {
      positiveTriggers: ['Barnaby the stuffed bear', 'Strawberry juice', 'Soft velvet pillows', 'Disney songs'],
      distressTriggers: ['Dark hallways', 'Angry voices', 'Medical needles'],
    },
    isVaultLocked: false,
    allowExternalBroadcast: false,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'alt_4',
    systemId: 'sys_1',
    name: 'Nyx',
    pronouns: ['they', 'them'],
    colorHex: '#8b5cf6',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    roles: ['Gatekeeper', 'Memory Holder'],
    ageAppearance: 'Ageless',
    description: 'Keeps inner calm, organizes headspace archives, fronts mostly during late quiet hours.',
    sensoryAnchors: {
      positiveTriggers: ['Rain sounds on window', 'Chamomile blend', 'Piano solos', 'Dim ambient lighting'],
      distressTriggers: ['Overly bright fluorescent lights'],
    },
    isVaultLocked: true,
    pinCode: '1234',
    allowExternalBroadcast: false,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
];

const initialBoards: Board[] = [
  {
    id: 'board_common',
    systemId: 'sys_1',
    scope: 'common',
    title: '📌 System Main Corkboard',
    theme: 'cork',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'board_alt_1',
    systemId: 'sys_1',
    scope: 'alter_private',
    ownerAlterId: 'alt_1',
    title: "Alex's Studio Canvas",
    theme: 'slate',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'board_alt_2',
    systemId: 'sys_1',
    scope: 'alter_private',
    ownerAlterId: 'alt_2',
    title: "Maya's Care Sanctuary",
    theme: 'whiteboard',
    createdAt: Date.now() - 10 * 86400000,
  },
];

const initialWidgets: BoardWidget[] = [
  {
    id: 'w_1',
    boardId: 'board_common',
    authorAlterId: 'alt_2',
    type: 'urgent_ribbon',
    position: { x: 30, y: 30, zIndex: 1, rotation: -1 },
    size: { width: 340, height: 130 },
    color: '#fee2e2',
    title: '⚠️ Urgent: Hydration & Medication Check',
    content: 'Body took morning meds at 9:00 AM. Please make sure whoever fronts drinks at least 2 full water bottles before 3:00 PM!',
    urgencyLevel: 'urgent',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'w_2',
    boardId: 'board_common',
    authorAlterId: 'alt_1',
    type: 'sticky_note',
    position: { x: 400, y: 40, zIndex: 2, rotation: 2 },
    size: { width: 300, height: 210 },
    color: '#fef3c7',
    title: '📝 System House Rules',
    content: '1. No deleting other alters notes or journals.\n2. If overwhelmed, leave a voice memo and step back.\n3. Barnaby the plush bear stays on the bed pillow for Leo.',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'w_3',
    boardId: 'board_common',
    authorAlterId: 'alt_3',
    type: 'checklist',
    position: { x: 30, y: 190, zIndex: 3, rotation: 0.5 },
    size: { width: 340, height: 240 },
    color: '#ecfdf5',
    title: '🛒 Shared Grocery Wishlist',
    checklistItems: [
      { id: 'c1', text: 'Strawberry fruit gummies (for Leo)', done: true },
      { id: 'c2', text: 'Peppermint herbal tea (for Maya)', done: false },
      { id: 'c3', text: 'Electrolyte powder tablets', done: false },
      { id: 'c4', text: 'Oat milk & whole grain bread', done: true },
    ],
    isPinned: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'w_4',
    boardId: 'board_common',
    authorAlterId: 'alt_2',
    type: 'rule_card',
    position: { x: 400, y: 280, zIndex: 4, rotation: -1.5 },
    size: { width: 300, height: 150 },
    color: '#ede9fe',
    title: '🛡️ Emergency Safety Protocol',
    content: 'If dissociation or sensory panic hits: Grab 15lb weighted blanket + peppermint oil. Put on noise canceling headset with 432Hz ambient sound.',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
  },
];

const initialTasks: Task[] = [
  {
    id: 'task_1',
    systemId: 'sys_1',
    creatorAlterId: 'alt_1',
    assignedAlterId: 'alt_2',
    title: 'Call Dr. Martinez Clinic regarding prescription refill',
    description: 'Phone calls trigger my anxiety; Maya, could you please take this call Thursday morning when you front?',
    priority: 'high',
    dueDate: Date.now() + 86400000 * 2,
    preferredFrontTimeWindow: 'Thursday 10:00 AM - 12:00 PM',
    status: 'accepted',
    isPrivate: false,
    handoffHistory: [
      {
        id: 'h1',
        taskId: 'task_1',
        fromAlterId: 'alt_1',
        toAlterId: 'alt_2',
        action: 'requested',
        notes: 'Created by Alex: Phone call requested for Maya.',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'h2',
        taskId: 'task_1',
        fromAlterId: 'alt_2',
        action: 'accepted',
        notes: 'Accepted by Maya: I will handle this during my Thursday morning front.',
        timestamp: Date.now() - 40000000,
      },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 40000000,
  },
  {
    id: 'task_2',
    systemId: 'sys_1',
    creatorAlterId: 'alt_2',
    assignedAlterId: 'alt_1',
    title: 'Finish Physics assignment problem set 3',
    description: 'Due on portal Friday night. Alex has the context for these equations.',
    priority: 'medium',
    dueDate: Date.now() + 86400000 * 3,
    preferredFrontTimeWindow: 'Wednesday evening',
    status: 'in_progress',
    isPrivate: false,
    handoffHistory: [
      {
        id: 'h3',
        taskId: 'task_2',
        fromAlterId: 'alt_2',
        toAlterId: 'alt_1',
        action: 'requested',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'h4',
        taskId: 'task_2',
        fromAlterId: 'alt_1',
        action: 'accepted',
        timestamp: Date.now() - 86400000,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'task_3',
    systemId: 'sys_1',
    creatorAlterId: 'alt_1',
    assignedAlterId: 'alt_3',
    title: 'Organize plush toys and pick Saturday morning cartoon',
    description: 'Put Barnaby and friends neatly on the bed shelf and enjoy quiet time.',
    priority: 'low',
    preferredFrontTimeWindow: 'Saturday morning',
    status: 'requested',
    isPrivate: false,
    handoffHistory: [
      {
        id: 'h5',
        taskId: 'task_3',
        fromAlterId: 'alt_1',
        toAlterId: 'alt_3',
        action: 'requested',
        timestamp: Date.now() - 3600000 * 5,
      },
    ],
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
];

const initialChannels: Channel[] = [
  {
    id: 'ch_general',
    systemId: 'sys_1',
    type: 'general',
    name: '🌟 System General',
    description: 'Shared open space for all alters to leave daily messages.',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'ch_finances',
    systemId: 'sys_1',
    type: 'topic',
    name: '💼 Finances & Budget',
    description: 'Logging body expenses, rent calculations, and purchases.',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'ch_therapy',
    systemId: 'sys_1',
    type: 'topic',
    name: '🩺 Therapy & Health Notes',
    description: 'Notes from sessions with therapist, trigger logs, insights.',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'ch_dm_alex_maya',
    systemId: 'sys_1',
    type: 'dm',
    name: '🔒 DM: Alex & Maya',
    description: 'Direct coordination between Host and Protector.',
    participantAlterIds: ['alt_1', 'alt_2'],
    createdAt: Date.now() - 15 * 86400000,
  },
];

const initialMessages: InnerMessage[] = [
  {
    id: 'm_1',
    channelId: 'ch_general',
    senderAlterId: 'alt_1',
    content: 'Hey everyone! I left a fresh cup of peppermint tea in the mug on the desk. Have a smooth afternoon.',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'm_2',
    channelId: 'ch_general',
    senderAlterId: 'alt_2',
    content: 'Thank you Alex! I fronted around 1:00 PM and took the body for a short 15-min walk outside. Energy is stable.',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'm_3',
    channelId: 'ch_general',
    senderAlterId: 'alt_3',
    content: 'Barnaby and I drew a picture of a rainbow cat! It is pinned in the sketchbook 🎨',
    createdAt: Date.now() - 3600000 * 1,
  },
];

const initialBodyNeeds: BodyNeedsMeter = {
  energyScore: 7,
  hydrationScore: 6,
  sensoryOverloadScore: 3,
  lastMealTime: Date.now() - 3600000 * 3,
  lastWaterTime: Date.now() - 3600000 * 1,
  medications: [
    {
      id: 'med_1',
      name: 'Sertraline (50mg)',
      dosage: '1 tablet with breakfast',
      timeOfDay: 'Morning',
      takenToday: true,
      lastTakenAt: Date.now() - 3600000 * 9,
      takenByAlterId: 'alt_1',
    },
    {
      id: 'med_2',
      name: 'Hydroxyzine (25mg)',
      dosage: 'As needed for acute sensory anxiety',
      timeOfDay: 'As Needed',
      takenToday: false,
    },
    {
      id: 'med_3',
      name: 'Magnesium Glycinate (200mg)',
      dosage: '1 capsule before sleep',
      timeOfDay: 'Night',
      takenToday: false,
    },
  ],
  updatedAt: Date.now(),
  updatedByAlterId: 'alt_1',
};

const initialWebhooks: SwitchWebhookConfig[] = [
  {
    id: 'wh_1',
    systemId: 'sys_1',
    isEnabled: false,
    name: 'Discord Front Channel Alert',
    preset: 'discord_webhook',
    url: '',
    triggerOnEvents: ['front_changed', 'co_front_changed'],
  },
];

const initialPlaylists: GroundingPlaylist[] = [
  {
    id: 'pl_1',
    systemId: 'sys_1',
    title: '🌿 432Hz Deep Calming & Nervous System Reset',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=1ZYbU8csBGw',
    embedUrl: 'https://www.youtube.com/embed/1ZYbU8csBGw',
    tags: ['432Hz', 'Binaural', 'Sensory Grounding', 'Panic Anchor'],
    description: 'Calming ambient soundscapes tuned to 432Hz to ease sensory overload.',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'pl_2',
    systemId: 'sys_1',
    title: '☕ Lofi Girl — Beats to Relax / Study to',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    customAlterId: 'alt_1',
    tags: ['Lo-Fi', 'Study', 'Alex Anchor', 'Focus'],
    description: "Alex's favorite smooth beats for working and staying oriented in the front.",
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'pl_3',
    systemId: 'sys_1',
    title: '🌧️ Heavy Rain on Window & Peaceful Piano (Maya & Nyx)',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    embedUrl: 'https://www.youtube.com/embed/mPZkdNFkNps',
    customAlterId: 'alt_2',
    tags: ['Rain', 'Sleep', 'Night Anchor', 'Deep Rest'],
    description: 'Steady rain sounds paired with gentle piano for winding down and grounding after high stress.',
    createdAt: Date.now() - 10 * 86400000,
  },
];

const initialRules: SystemRule[] = [
  {
    id: 'rule_1',
    systemId: 'sys_1',
    title: 'Finances & Purchases Over $50',
    description: 'Any non-essential personal purchase over $50 must be proposed in #finances or on the Common Board with at least 12 hours notice so system consensus is reached.',
    category: 'finances',
    severity: 'critical',
    creatorAlterId: 'alt_1',
    isLocked: true,
    acknowledgements: {
      alt_1: { alterId: 'alt_1', acknowledged: true, timestamp: Date.now() - 10 * 86400000, comment: 'Agreed. Prevents impulsivity.' },
      alt_2: { alterId: 'alt_2', acknowledged: true, timestamp: Date.now() - 9 * 86400000, comment: 'Crucial for rent & therapy budget.' },
      alt_3: { alterId: 'alt_3', acknowledged: true, timestamp: Date.now() - 8 * 86400000, comment: 'Fair, just let me buy canvas supplies when needed.' },
      alt_4: { alterId: 'alt_4', acknowledged: true, timestamp: Date.now() - 8 * 86400000, comment: 'Toby agrees! (Except plushies!)' },
    },
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'rule_2',
    systemId: 'sys_1',
    title: 'Workplace & External Masking Protocol',
    description: 'During office hours (9:00 AM - 5:00 PM Mon-Fri), maintain host presentation (Alex) with clients & manager. If feeling rapid switching, take a 10-min bathroom break and switch with Maya.',
    category: 'fronting',
    severity: 'critical',
    creatorAlterId: 'alt_2',
    isLocked: true,
    acknowledgements: {
      alt_1: { alterId: 'alt_1', acknowledged: true, timestamp: Date.now() - 12 * 86400000 },
      alt_2: { alterId: 'alt_2', acknowledged: true, timestamp: Date.now() - 12 * 86400000 },
      alt_3: { alterId: 'alt_3', acknowledged: true, timestamp: Date.now() - 11 * 86400000 },
    },
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'rule_3',
    systemId: 'sys_1',
    title: 'Safe Space & Little Protection Protocol',
    description: 'Toby (little) is never to be left fronting alone in tense social situations, driving, or doctor appointments. Maya or Leo must step in immediately if distress occurs.',
    category: 'safety',
    severity: 'critical',
    creatorAlterId: 'alt_2',
    isLocked: true,
    acknowledgements: {
      alt_1: { alterId: 'alt_1', acknowledged: true, timestamp: Date.now() - 13 * 86400000 },
      alt_2: { alterId: 'alt_2', acknowledged: true, timestamp: Date.now() - 13 * 86400000 },
      alt_3: { alterId: 'alt_3', acknowledged: true, timestamp: Date.now() - 10 * 86400000 },
      alt_4: { alterId: 'alt_4', acknowledged: true, timestamp: Date.now() - 10 * 86400000 },
    },
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'rule_4',
    systemId: 'sys_1',
    title: 'Bedtime & Evening Sensory Wind-Down',
    description: 'Screens off or dimmed by 10:30 PM. Bedtime anchor: 432Hz ambient rain audio, lavender tea, and heavy blanket.',
    category: 'health',
    severity: 'standard',
    creatorAlterId: 'alt_1',
    isLocked: false,
    acknowledgements: {
      alt_1: { alterId: 'alt_1', acknowledged: true, timestamp: Date.now() - 5 * 86400000 },
      alt_2: { alterId: 'alt_2', acknowledged: true, timestamp: Date.now() - 4 * 86400000 },
    },
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
];

const initialPolls: SystemPoll[] = [
  {
    id: 'poll_1',
    systemId: 'sys_1',
    title: 'Saturday Weekend Reward Activity',
    description: 'We completed the midterm tasks and cleaned the whole apartment! Which activity should we do this Saturday?',
    category: 'social',
    creatorAlterId: 'alt_4',
    options: [
      { id: 'opt_1', text: '🐠 Aquarium visit & souvenir sticker book', color: '#06b6d4' },
      { id: 'opt_2', text: '☕ Indie bookstore & matcha latte reading', color: '#6366f1' },
      { id: 'opt_3', text: '🎨 Botanical garden sketching & boba tea', color: '#10b981' },
    ],
    allowVeto: false,
    status: 'active',
    votes: {
      alt_4: { alterId: 'alt_4', optionId: 'opt_1', timestamp: Date.now() - 86400000 * 2, comment: 'We get to see the sea otters!' },
      alt_2: { alterId: 'alt_2', optionId: 'opt_1', timestamp: Date.now() - 86400000 * 2, comment: 'Aquarium sounds relaxing and safe.' },
      alt_1: { alterId: 'alt_1', optionId: 'opt_2', timestamp: Date.now() - 86400000, comment: 'Bookstore is calmer, but okay with aquarium.' },
      alt_3: { alterId: 'alt_3', optionId: 'opt_3', timestamp: Date.now() - 3600000 * 12, comment: 'Garden sketching would be awesome too.' },
    },
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'poll_2',
    systemId: 'sys_1',
    title: 'Hair Style & Color Refresh Next Month',
    description: 'Our hair is getting past the shoulders. Should we dye emerald green tips or keep it natural dark brown with clip-ins?',
    category: 'appearance',
    creatorAlterId: 'alt_3',
    options: [
      { id: 'opt_a', text: '🌲 Deep emerald green tips (subtle gradient)', color: '#10b981' },
      { id: 'opt_b', text: '✂️ Natural dark brown cut + clip-in color streaks', color: '#64748b' },
    ],
    allowVeto: true,
    status: 'active',
    votes: {
      alt_3: { alterId: 'alt_3', optionId: 'opt_a', timestamp: Date.now() - 86400000, comment: 'Green looks super sharp and creative.' },
      alt_4: { alterId: 'alt_4', optionId: 'opt_a', timestamp: Date.now() - 3600000 * 18, comment: 'Green like a tree frog! Yay!' },
      alt_1: { alterId: 'alt_1', optionId: 'opt_b', timestamp: Date.now() - 3600000 * 5, comment: 'Worried about conservative work client meetings. Clip-ins might be safer?' },
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 5,
  },
];

const initialContacts: ExternalContact[] = [
  {
    id: 'cnt_1',
    systemId: 'sys_1',
    name: 'Dr. Elena Vance',
    relationship: 'Therapist / Medical',
    disclosureLevel: 'fully_out',
    safetyNotes: 'Licensed dissociative disorders specialist. Safe to openly discuss switches, all alters, and grounding protocols.',
    phoneOrContact: '(555) 382-9104 — Clinic Room 4B',
    avatarColor: '#10b981',
    alterRelationships: {
      alt_1: { alterId: 'alt_1', comfortLevel: 'comfortable', isOutTo: true, notes: 'Manages weekly scheduling & homework.' },
      alt_2: { alterId: 'alt_2', comfortLevel: 'comfortable', isOutTo: true, notes: 'Discusses safety boundaries and triggers.' },
      alt_3: { alterId: 'alt_3', comfortLevel: 'comfortable', isOutTo: true, notes: 'Shares art metaphors and creative expression.' },
      alt_4: { alterId: 'alt_4', comfortLevel: 'comfortable', isOutTo: true, notes: 'Plays with sand tray miniatures.' },
    },
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'cnt_2',
    systemId: 'sys_1',
    name: 'Sarah Jenkins',
    relationship: 'Partner',
    disclosureLevel: 'fully_out',
    safetyNotes: 'Partner of 3 years. Knows individual alter names, pronouns, and sensory preferences. Safe co-regulation anchor.',
    phoneOrContact: '(555) 729-1145',
    avatarColor: '#ec4899',
    alterRelationships: {
      alt_1: { alterId: 'alt_1', comfortLevel: 'comfortable', isOutTo: true, notes: 'Romantic partner.' },
      alt_2: { alterId: 'alt_2', comfortLevel: 'comfortable', isOutTo: true, notes: 'Close trusted friend and co-planner.' },
      alt_3: { alterId: 'alt_3', comfortLevel: 'comfortable', isOutTo: true, notes: 'Bonds over museum visits and cooking.' },
      alt_4: { alterId: 'alt_4', comfortLevel: 'comfortable', isOutTo: true, notes: 'Reads bedtime stories and plays video games.' },
    },
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'cnt_3',
    systemId: 'sys_1',
    name: 'Mark Thompson',
    relationship: 'Coworker',
    disclosureLevel: 'covert_only',
    maskingPersona: 'Act strictly as Alex (Host). Keep topics strictly focused on sprint tickets, code reviews, and light weekend small talk.',
    safetyNotes: 'Work supervisor. Strictly covert. No mention of plural system, therapy, or inner world.',
    phoneOrContact: 'm.thompson@company.internal / Slack @mthompson',
    avatarColor: '#f59e0b',
    alterRelationships: {
      alt_1: { alterId: 'alt_1', comfortLevel: 'comfortable', isOutTo: false, notes: 'Handles all direct communication & 1-on-1s.' },
      alt_2: { alterId: 'alt_2', comfortLevel: 'cautious', isOutTo: false, notes: 'Steps in only if high firmness needed.' },
      alt_3: { alterId: 'alt_3', comfortLevel: 'avoid', isOutTo: false, notes: 'Avoids interacting.' },
      alt_4: { alterId: 'alt_4', comfortLevel: 'avoid', isOutTo: false, notes: 'Strictly prohibited from fronting.' },
    },
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'cnt_4',
    systemId: 'sys_1',
    name: 'Emma Wu',
    relationship: 'Friend',
    disclosureLevel: 'partially_out',
    maskingPersona: 'Knows Alex & Maya. Aware that we are a system, but has not met Toby or Leo yet.',
    safetyNotes: 'Warm and supportive ally. Respects switching, but prefers notice before sudden topic shifts.',
    phoneOrContact: '(555) 441-8920',
    avatarColor: '#8b5cf6',
    alterRelationships: {
      alt_1: { alterId: 'alt_1', comfortLevel: 'comfortable', isOutTo: true, notes: 'College friend.' },
      alt_2: { alterId: 'alt_2', comfortLevel: 'comfortable', isOutTo: true, notes: 'Talks about books and baking.' },
      alt_3: { alterId: 'alt_3', comfortLevel: 'neutral', isOutTo: false, notes: 'Not officially introduced.' },
      alt_4: { alterId: 'alt_4', comfortLevel: 'neutral', isOutTo: false, notes: 'Not officially introduced.' },
    },
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
];

const initialDevicePrefs: DevicePreferences = {
  soundEnabled: true,
  soundVolume: 0.5,
  soundPack: 'chimes',
  hapticsEnabled: true,
  viewMode: 'auto',
};

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load local storage state', e);
  }
  return null;
};

const mergeSavedState = (saved: any) => {
  if (!saved) {
    return {
      system: initialSystem,
      alters: initialAlters,
      boards: initialBoards,
      widgets: initialWidgets,
      tasks: initialTasks,
      channels: initialChannels,
      messages: initialMessages,
      bodyNeeds: initialBodyNeeds,
      webhooks: initialWebhooks,
      playlists: initialPlaylists,
      rules: initialRules,
      polls: initialPolls,
      contacts: initialContacts,
      devicePrefs: initialDevicePrefs,
      activeBoardId: 'board_common',
      activeChannelId: 'ch_general',
      activeFronts: [
        { alterId: 'alt_1', status: 'front', startedAt: Date.now() - 3600000 * 2 },
        { alterId: 'alt_2', status: 'co-front', startedAt: Date.now() - 3600000 },
      ],
      frontLogs: [
        {
          id: 'fl_1',
          systemId: 'sys_1',
          alterId: 'alt_1',
          status: 'front',
          startedAt: Date.now() - 3600000 * 8,
          endedAt: Date.now() - 3600000 * 3,
          energyLevel: 8,
          notes: 'Handled morning lectures and reading.',
        },
        {
          id: 'fl_2',
          systemId: 'sys_1',
          alterId: 'alt_2',
          status: 'front',
          startedAt: Date.now() - 3600000 * 3,
          endedAt: Date.now() - 3600000 * 2,
          energyLevel: 7,
          notes: 'Lunch break and boundary setting with noisy neighbors.',
        },
      ],
    };
  }

  const mergedBodyNeeds: BodyNeedsMeter = {
    ...initialBodyNeeds,
    ...(saved.bodyNeeds || {}),
    medications:
      Array.isArray(saved.bodyNeeds?.medications) && saved.bodyNeeds.medications.length > 0
        ? saved.bodyNeeds.medications
        : initialBodyNeeds.medications,
  };

  const mergedBoards: Board[] =
    Array.isArray(saved.boards) && saved.boards.length > 0
      ? saved.boards.map((b: any) => ({
          ...b,
          theme: b.theme || 'cork',
          scope: b.scope || (b.ownerAlterId ? 'alter_private' : 'common'),
        }))
      : initialBoards;

  const mergedAlters: Alter[] =
    Array.isArray(saved.alters) && saved.alters.length > 0
      ? saved.alters.map((a: any) => ({
          ...a,
          pronouns: Array.isArray(a.pronouns) ? a.pronouns : ['they', 'them'],
          roles: Array.isArray(a.roles) ? a.roles : ['Host'],
          sensoryAnchors: a.sensoryAnchors || { positiveTriggers: [], distressTriggers: [] },
          allowExternalBroadcast: a.allowExternalBroadcast ?? true,
        }))
      : initialAlters;

  return {
    system: saved.system || initialSystem,
    alters: mergedAlters,
    boards: mergedBoards,
    widgets: Array.isArray(saved.widgets) && saved.widgets.length > 0 ? saved.widgets : initialWidgets,
    tasks: Array.isArray(saved.tasks) && saved.tasks.length > 0 ? saved.tasks : initialTasks,
    channels: Array.isArray(saved.channels) && saved.channels.length > 0 ? saved.channels : initialChannels,
    messages: Array.isArray(saved.messages) && saved.messages.length > 0 ? saved.messages : initialMessages,
    bodyNeeds: mergedBodyNeeds,
    webhooks: Array.isArray(saved.webhooks) && saved.webhooks.length > 0 ? saved.webhooks : initialWebhooks,
    playlists: Array.isArray(saved.playlists) && saved.playlists.length > 0 ? saved.playlists : initialPlaylists,
    rules: Array.isArray(saved.rules) && saved.rules.length > 0 ? saved.rules : initialRules,
    polls: Array.isArray(saved.polls) && saved.polls.length > 0 ? saved.polls : initialPolls,
    contacts: Array.isArray(saved.contacts) && saved.contacts.length > 0 ? saved.contacts : initialContacts,
    devicePrefs: { ...initialDevicePrefs, ...(saved.devicePrefs || {}) },
    activeBoardId: saved.activeBoardId || mergedBoards[0]?.id || 'board_common',
    activeChannelId: saved.activeChannelId || 'ch_general',
    activeFronts: Array.isArray(saved.activeFronts) && saved.activeFronts.length > 0
      ? saved.activeFronts
      : [
          { alterId: mergedAlters[0]?.id || 'alt_1', status: 'front', startedAt: Date.now() - 3600000 * 2 },
          { alterId: mergedAlters[1]?.id || 'alt_2', status: 'co-front', startedAt: Date.now() - 3600000 },
        ],
    frontLogs: Array.isArray(saved.frontLogs) && saved.frontLogs.length > 0 ? saved.frontLogs : [
      {
        id: 'fl_1',
        systemId: 'sys_1',
        alterId: 'alt_1',
        status: 'front',
        startedAt: Date.now() - 3600000 * 8,
        endedAt: Date.now() - 3600000 * 3,
        energyLevel: 8,
        notes: 'Handled morning lectures and reading.',
      },
    ],
  };
};

const hydrated = mergeSavedState(loadSavedState());

export const useSystemStore = create<SystemState>((set, get) => ({
  system: hydrated.system,
  alters: hydrated.alters,
  activeFronts: hydrated.activeFronts,
  frontLogs: hydrated.frontLogs,
  activeBoardId: hydrated.activeBoardId,
  boards: hydrated.boards,
  widgets: hydrated.widgets,
  tasks: hydrated.tasks,
  activeChannelId: hydrated.activeChannelId,
  channels: hydrated.channels,
  messages: hydrated.messages,
  bodyNeeds: hydrated.bodyNeeds,
  webhooks: hydrated.webhooks,
  playlists: hydrated.playlists,
  devicePrefs: hydrated.devicePrefs,

  rules: hydrated.rules,
  polls: hydrated.polls,
  contacts: hydrated.contacts,
  isQrSyncModalOpen: false,

  isBriefingModalOpen: false,
  briefingAlterId: null,

  resetToDefaultData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    const fresh = mergeSavedState(null);
    set({
      system: fresh.system,
      alters: fresh.alters,
      boards: fresh.boards,
      widgets: fresh.widgets,
      tasks: fresh.tasks,
      channels: fresh.channels,
      messages: fresh.messages,
      bodyNeeds: fresh.bodyNeeds,
      webhooks: fresh.webhooks,
      playlists: fresh.playlists,
      rules: fresh.rules,
      polls: fresh.polls,
      contacts: fresh.contacts,
      devicePrefs: fresh.devicePrefs,
      activeBoardId: fresh.activeBoardId,
      activeChannelId: fresh.activeChannelId,
      activeFronts: fresh.activeFronts,
      frontLogs: fresh.frontLogs,
    });
    saveStore(fresh);
  },

  updateSystem: (updates: Partial<System>) => {
    set((state: SystemState) => {
      const updated = { ...state.system, ...updates, updatedAt: Date.now() };
      saveStore({ ...state, system: updated });
      return { system: updated };
    });
  },

  addAlter: (alterData: Omit<Alter, 'id' | 'createdAt' | 'updatedAt'>) => {
    set((state: SystemState) => {
      const newAlter: Alter = {
        ...alterData,
        id: 'alt_' + Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const newBoard: Board = {
        id: 'board_' + newAlter.id,
        systemId: state.system.id,
        scope: 'alter_private',
        ownerAlterId: newAlter.id,
        title: `${newAlter.name}'s Canvas Space`,
        theme: 'cork',
        createdAt: Date.now(),
      };
      const updatedAlters = [...state.alters, newAlter];
      const updatedBoards = [...state.boards, newBoard];
      saveStore({ ...state, alters: updatedAlters, boards: updatedBoards });
      return { alters: updatedAlters, boards: updatedBoards };
    });
  },

  updateAlter: (id: string, updates: Partial<Alter>) => {
    set((state: SystemState) => {
      const updatedAlters = state.alters.map((a: Alter) =>
        a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
      );
      saveStore({ ...state, alters: updatedAlters });
      return { alters: updatedAlters };
    });
  },

  deleteAlter: (id: string) => {
    set((state: SystemState) => {
      const updatedAlters = state.alters.filter((a: Alter) => a.id !== id);
      const updatedFronts = state.activeFronts.filter((f: FrontMember) => f.alterId !== id);
      saveStore({ ...state, alters: updatedAlters, activeFronts: updatedFronts });
      return { alters: updatedAlters, activeFronts: updatedFronts };
    });
  },

  setFront: (alterId: string, status: 'front' | 'co-front' | 'co-conscious', note?: string, energy?: number) => {
    set((state: SystemState) => {
      const now = Date.now();
      let updatedFronts = [...state.activeFronts];

      const activeEntry = updatedFronts.find((f: FrontMember) => f.alterId === alterId);
      if (activeEntry) {
        updatedFronts = updatedFronts.map((f: FrontMember) =>
          f.alterId === alterId ? { ...f, status, startedAt: now } : f
        );
      } else {
        if (status === 'front') {
          updatedFronts = updatedFronts.map((f: FrontMember) =>
            f.status === 'front' ? { ...f, status: 'co-front' as const } : f
          );
        }
        updatedFronts.push({ alterId, status, startedAt: now });
      }

      const newLog: FrontLog = {
        id: 'fl_' + now,
        systemId: state.system.id,
        alterId,
        status,
        startedAt: now,
        energyLevel: energy || state.bodyNeeds.energyScore,
        notes: note,
      };

      const updatedLogs = [newLog, ...state.frontLogs];

      const mainFront = state.alters.find((a: Alter) => a.id === alterId) || null;
      const coFronts = state.alters.filter((a: Alter) =>
        updatedFronts.some((f: FrontMember) => f.alterId === a.id && f.alterId !== alterId)
      );

      state.webhooks.forEach((wh: SwitchWebhookConfig) => {
        if (wh.isEnabled) {
          dispatchSwitchWebhook(wh, mainFront, coFronts, note).then((res) => {
            get().updateWebhook(wh.id, {
              lastTriggeredAt: Date.now(),
              lastStatus: res.success ? 'success' : 'failed',
              lastError: res.error,
            });
          });
        }
      });

      saveStore({ ...state, activeFronts: updatedFronts, frontLogs: updatedLogs });
      return {
        activeFronts: updatedFronts,
        frontLogs: updatedLogs,
        isBriefingModalOpen: true,
        briefingAlterId: alterId,
      };
    });
  },

  removeFromFront: (alterId: string) => {
    set((state: SystemState) => {
      const now = Date.now();
      const updatedFronts = state.activeFronts.filter((f: FrontMember) => f.alterId !== alterId);
      const updatedLogs = state.frontLogs.map((l: FrontLog) =>
        l.alterId === alterId && !l.endedAt ? { ...l, endedAt: now } : l
      );
      saveStore({ ...state, activeFronts: updatedFronts, frontLogs: updatedLogs });
      return { activeFronts: updatedFronts, frontLogs: updatedLogs };
    });
  },

  clearFronts: () => {
    set((state: SystemState) => {
      saveStore({ ...state, activeFronts: [] });
      return { activeFronts: [] };
    });
  },

  setActiveBoardId: (boardId: string) => set({ activeBoardId: boardId }),

  addBoard: (boardData: Omit<Board, 'id' | 'createdAt'>) => {
    set((state: SystemState) => {
      const newBoard: Board = {
        ...boardData,
        id: 'board_' + Date.now(),
        createdAt: Date.now(),
      };
      const updatedBoards = [...state.boards, newBoard];
      saveStore({ ...state, boards: updatedBoards });
      return { boards: updatedBoards, activeBoardId: newBoard.id };
    });
  },

  updateBoard: (id: string, updates: Partial<Board>) => {
    set((state: SystemState) => {
      const updatedBoards = state.boards.map((b: Board) =>
        b.id === id ? { ...b, ...updates } : b
      );
      saveStore({ ...state, boards: updatedBoards });
      return { boards: updatedBoards };
    });
  },

  deleteBoard: (id: string) => {
    set((state: SystemState) => {
      if (state.boards.length <= 1) {
        return state; // Keep at least one board
      }
      const updatedBoards = state.boards.filter((b: Board) => b.id !== id);
      const nextActiveId =
        state.activeBoardId === id ? updatedBoards[0].id : state.activeBoardId;
      const updatedWidgets = state.widgets.filter((w: BoardWidget) => w.boardId !== id);
      saveStore({ ...state, boards: updatedBoards, widgets: updatedWidgets });
      return {
        boards: updatedBoards,
        activeBoardId: nextActiveId,
        widgets: updatedWidgets,
      };
    });
  },

  addWidget: (widgetData: Omit<BoardWidget, 'id' | 'createdAt' | 'updatedAt'>) => {
    set((state: SystemState) => {
      const newWidget: BoardWidget = {
        ...widgetData,
        id: 'w_' + Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updatedWidgets = [...state.widgets, newWidget];
      saveStore({ ...state, widgets: updatedWidgets });
      return { widgets: updatedWidgets };
    });
  },

  updateWidget: (id: string, updates: Partial<BoardWidget>) => {
    set((state: SystemState) => {
      const updatedWidgets = state.widgets.map((w: BoardWidget) =>
        w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
      );
      saveStore({ ...state, widgets: updatedWidgets });
      return { widgets: updatedWidgets };
    });
  },

  deleteWidget: (id: string) => {
    set((state: SystemState) => {
      const updatedWidgets = state.widgets.filter((w: BoardWidget) => w.id !== id);
      saveStore({ ...state, widgets: updatedWidgets });
      return { widgets: updatedWidgets };
    });
  },

  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'handoffHistory'>) => {
    set((state: SystemState) => {
      const now = Date.now();
      const newTask: Task = {
        ...taskData,
        id: 'task_' + now,
        handoffHistory: [
          {
            id: 'h_' + now,
            taskId: 'task_' + now,
            fromAlterId: taskData.creatorAlterId,
            toAlterId: taskData.assignedAlterId,
            action: 'requested',
            notes: `Requested for ${state.alters.find((a: Alter) => a.id === taskData.assignedAlterId)?.name || 'alter'}`,
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      const updatedTasks = [newTask, ...state.tasks];
      saveStore({ ...state, tasks: updatedTasks });
      return { tasks: updatedTasks };
    });
  },

  updateTaskStatus: (
    taskId: string,
    status: TaskNegotiationStatus,
    alterId: string,
    notes?: string,
    suggestedReassignmentAlterId?: string
  ) => {
    set((state: SystemState) => {
      const now = Date.now();
      const updatedTasks = state.tasks.map((t: Task) => {
        if (t.id !== taskId) return t;

        const newHandoffEvent = {
          id: 'h_' + now,
          taskId: t.id,
          fromAlterId: alterId,
          toAlterId: suggestedReassignmentAlterId || t.assignedAlterId,
          action: (status === 'declined' ? 'declined' : status === 'accepted' ? 'accepted' : status === 'completed' ? 'completed' : 'handoff_requested') as any,
          notes: notes || `Status changed to ${status}`,
          timestamp: now,
        };

        return {
          ...t,
          status,
          declineReason: status === 'declined' ? notes : t.declineReason,
          suggestedReassignmentAlterId: suggestedReassignmentAlterId || t.suggestedReassignmentAlterId,
          assignedAlterId: (status === 'declined' && suggestedReassignmentAlterId) ? suggestedReassignmentAlterId : t.assignedAlterId,
          handoffHistory: [...t.handoffHistory, newHandoffEvent],
          updatedAt: now,
        };
      });

      saveStore({ ...state, tasks: updatedTasks });
      return { tasks: updatedTasks };
    });
  },

  deleteTask: (id: string) => {
    set((state: SystemState) => {
      const updatedTasks = state.tasks.filter((t: Task) => t.id !== id);
      saveStore({ ...state, tasks: updatedTasks });
      return { tasks: updatedTasks };
    });
  },

  setActiveChannelId: (id: string) => set({ activeChannelId: id }),

  addChannel: (channelData: Omit<Channel, 'id' | 'createdAt'>) => {
    set((state: SystemState) => {
      const newChannel: Channel = {
        ...channelData,
        id: 'ch_' + Date.now(),
        createdAt: Date.now(),
      };
      const updatedChannels = [...state.channels, newChannel];
      saveStore({ ...state, channels: updatedChannels });
      return { channels: updatedChannels, activeChannelId: newChannel.id };
    });
  },

  sendMessage: (channelId: string, senderAlterId: string, content: string, audioUrl?: string, audioDurationSec?: number) => {
    set((state: SystemState) => {
      const newMessage: InnerMessage = {
        id: 'msg_' + Date.now(),
        channelId,
        senderAlterId,
        content,
        audioUrl,
        audioDurationSec,
        createdAt: Date.now(),
      };
      const updatedMessages = [...state.messages, newMessage];
      saveStore({ ...state, messages: updatedMessages });
      return { messages: updatedMessages };
    });
  },

  pinMessageToBoard: (messageId: string, boardId: string) => {
    set((state: SystemState) => {
      const message = state.messages.find((m: InnerMessage) => m.id === messageId);
      if (!message) return state;

      const sender = state.alters.find((a: Alter) => a.id === message.senderAlterId);
      const newWidget: BoardWidget = {
        id: 'w_' + Date.now(),
        boardId,
        authorAlterId: message.senderAlterId,
        type: message.audioUrl ? 'voice_memo' : 'sticky_note',
        position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200, zIndex: 10, rotation: (Math.random() - 0.5) * 6 },
        size: { width: 300, height: 180 },
        color: sender ? sender.colorHex + '22' : '#fef3c7',
        title: `💬 Pinned from Inner Chat (${sender?.name || 'Alter'})`,
        content: message.content,
        audioUrl: message.audioUrl,
        audioDurationSec: message.audioDurationSec,
        isPinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedWidgets = [...state.widgets, newWidget];
      const updatedMessages = state.messages.map((m: InnerMessage) =>
        m.id === messageId ? { ...m, pinnedToBoardId: boardId } : m
      );

      saveStore({ ...state, widgets: updatedWidgets, messages: updatedMessages });
      return { widgets: updatedWidgets, messages: updatedMessages };
    });
  },

  updateBodyNeeds: (updates: Partial<BodyNeedsMeter>) => {
    set((state: SystemState) => {
      const updatedBody = { ...state.bodyNeeds, ...updates, updatedAt: Date.now() };
      saveStore({ ...state, bodyNeeds: updatedBody });
      return { bodyNeeds: updatedBody };
    });
  },

  addMedication: (medData: Omit<MedicationRecord, 'id' | 'takenToday' | 'lastTakenAt' | 'takenByAlterId'>) => {
    set((state: SystemState) => {
      const newMed: MedicationRecord = {
        ...medData,
        id: 'med_' + Date.now(),
        takenToday: false,
      };
      const updatedMeds = [...state.bodyNeeds.medications, newMed];
      const updatedBody = { ...state.bodyNeeds, medications: updatedMeds, updatedAt: Date.now() };
      saveStore({ ...state, bodyNeeds: updatedBody });
      return { bodyNeeds: updatedBody };
    });
  },

  deleteMedication: (medId: string) => {
    set((state: SystemState) => {
      const updatedMeds = state.bodyNeeds.medications.filter((m) => m.id !== medId);
      const updatedBody = { ...state.bodyNeeds, medications: updatedMeds, updatedAt: Date.now() };
      saveStore({ ...state, bodyNeeds: updatedBody });
      return { bodyNeeds: updatedBody };
    });
  },

  toggleMedicationTaken: (medId: string, alterId: string) => {
    set((state: SystemState) => {
      const updatedMeds = state.bodyNeeds.medications.map((m) => {
        if (m.id !== medId) return m;
        const willBeTaken = !m.takenToday;
        return {
          ...m,
          takenToday: willBeTaken,
          lastTakenAt: willBeTaken ? Date.now() : m.lastTakenAt,
          takenByAlterId: willBeTaken ? alterId : m.takenByAlterId,
        };
      });
      const updatedBody = { ...state.bodyNeeds, medications: updatedMeds, updatedAt: Date.now(), updatedByAlterId: alterId };
      saveStore({ ...state, bodyNeeds: updatedBody });
      return { bodyNeeds: updatedBody };
    });
  },

  addWebhook: (webhookData: Omit<SwitchWebhookConfig, 'id'>) => {
    set((state: SystemState) => {
      const newWh: SwitchWebhookConfig = {
        ...webhookData,
        id: 'wh_' + Date.now(),
      };
      const updatedWebhooks = [...state.webhooks, newWh];
      saveStore({ ...state, webhooks: updatedWebhooks });
      return { webhooks: updatedWebhooks };
    });
  },

  updateWebhook: (id: string, updates: Partial<SwitchWebhookConfig>) => {
    set((state: SystemState) => {
      const updatedWebhooks = state.webhooks.map((w: SwitchWebhookConfig) =>
        w.id === id ? { ...w, ...updates } : w
      );
      saveStore({ ...state, webhooks: updatedWebhooks });
      return { webhooks: updatedWebhooks };
    });
  },

  deleteWebhook: (id: string) => {
    set((state: SystemState) => {
      const updatedWebhooks = state.webhooks.filter((w: SwitchWebhookConfig) => w.id !== id);
      saveStore({ ...state, webhooks: updatedWebhooks });
      return { webhooks: updatedWebhooks };
    });
  },

  addPlaylist: (playlistData: Omit<GroundingPlaylist, 'id' | 'createdAt'>) => {
    set((state: SystemState) => {
      const newPl: GroundingPlaylist = {
        ...playlistData,
        id: 'pl_' + Date.now(),
        createdAt: Date.now(),
      };
      const updated = [...state.playlists, newPl];
      saveStore({ ...state, playlists: updated });
      return { playlists: updated };
    });
  },

  deletePlaylist: (id: string) => {
    set((state: SystemState) => {
      const updated = state.playlists.filter((p: GroundingPlaylist) => p.id !== id);
      saveStore({ ...state, playlists: updated });
      return { playlists: updated };
    });
  },

  updateDevicePrefs: (updates: Partial<DevicePreferences>) => {
    set((state: SystemState) => {
      const updated = { ...state.devicePrefs, ...updates };
      saveStore({ ...state, devicePrefs: updated });
      return { devicePrefs: updated };
    });
  },

  triggerWebhookTest: async (id: string) => {
    const state = get();
    const wh = state.webhooks.find((w: SwitchWebhookConfig) => w.id === id);
    if (!wh) return { success: false, error: 'Webhook not found' };

    const mainFrontId = state.activeFronts.find((f: FrontMember) => f.status === 'front')?.alterId || state.activeFronts[0]?.alterId;
    const mainFront = state.alters.find((a: Alter) => a.id === mainFrontId) || state.alters[0];
    const coFronts = state.alters.filter((a: Alter) =>
      state.activeFronts.some((f: FrontMember) => f.alterId === a.id && f.alterId !== mainFront?.id)
    );

    const res = await dispatchSwitchWebhook(wh, mainFront, coFronts, '🧪 Test Ping Broadcast from AlterHaven Settings');
    get().updateWebhook(wh.id, {
      lastTriggeredAt: Date.now(),
      lastStatus: res.success ? 'success' : 'failed',
      lastError: res.error,
    });
    return res;
  },

  // 2. System Codex & Agreements Actions
  addRule: (ruleData: Omit<SystemRule, 'id' | 'createdAt' | 'updatedAt' | 'acknowledgements'>) => {
    set((state: SystemState) => {
      const now = Date.now();
      const newRule: SystemRule = {
        ...ruleData,
        id: 'rule_' + now,
        acknowledgements: {},
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newRule, ...state.rules];
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 480, 0.15, state.devicePrefs.soundVolume);
      saveStore({ ...state, rules: updated });
      return { rules: updated };
    });
  },

  updateRule: (id: string, updates: Partial<SystemRule>) => {
    set((state: SystemState) => {
      const updated = state.rules.map((r: SystemRule) =>
        r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
      );
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 520, 0.1, state.devicePrefs.soundVolume);
      saveStore({ ...state, rules: updated });
      return { rules: updated };
    });
  },

  deleteRule: (id: string) => {
    set((state: SystemState) => {
      const updated = state.rules.filter((r: SystemRule) => r.id !== id);
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 280, 0.2, state.devicePrefs.soundVolume);
      saveStore({ ...state, rules: updated });
      return { rules: updated };
    });
  },

  acknowledgeRule: (ruleId: string, alterId: string, comment?: string) => {
    set((state: SystemState) => {
      const updated = state.rules.map((r: SystemRule) => {
        if (r.id !== ruleId) return r;
        const now = Date.now();
        const existing = r.acknowledgements[alterId];
        const updatedAcks = {
          ...r.acknowledgements,
          [alterId]: {
            alterId,
            acknowledged: existing ? !existing.acknowledged : true,
            timestamp: now,
            comment: comment !== undefined ? comment : existing?.comment,
          },
        };
        return {
          ...r,
          acknowledgements: updatedAcks,
          updatedAt: now,
        };
      });
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 620, 0.2, state.devicePrefs.soundVolume);
      saveStore({ ...state, rules: updated });
      return { rules: updated };
    });
  },

  // 3. Consensus & Polls Actions
  createPoll: (pollData: Omit<SystemPoll, 'id' | 'createdAt' | 'updatedAt' | 'votes'>) => {
    set((state: SystemState) => {
      const now = Date.now();
      const newPoll: SystemPoll = {
        ...pollData,
        id: 'poll_' + now,
        votes: {},
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newPoll, ...state.polls];
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 550, 0.18, state.devicePrefs.soundVolume);
      saveStore({ ...state, polls: updated });
      return { polls: updated };
    });
  },

  castVote: (pollId: string, alterId: string, optionId: string, comment?: string, isVeto?: boolean) => {
    set((state: SystemState) => {
      const updated = state.polls.map((p: SystemPoll) => {
        if (p.id !== pollId) return p;
        const now = Date.now();
        const updatedVotes = {
          ...p.votes,
          [alterId]: {
            alterId,
            optionId,
            timestamp: now,
            comment,
            isVeto: !!isVeto,
          },
        };
        return {
          ...p,
          votes: updatedVotes,
          updatedAt: now,
        };
      });
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, isVeto ? 320 : 580, 0.18, state.devicePrefs.soundVolume);
      saveStore({ ...state, polls: updated });
      return { polls: updated };
    });
  },

  resolvePoll: (pollId: string, resolvedOptionId?: string) => {
    set((state: SystemState) => {
      const updated = state.polls.map((p: SystemPoll) =>
        p.id === pollId ? { ...p, status: 'resolved' as const, resolvedOptionId, updatedAt: Date.now() } : p
      );
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 660, 0.25, state.devicePrefs.soundVolume);
      saveStore({ ...state, polls: updated });
      return { polls: updated };
    });
  },

  deletePoll: (id: string) => {
    set((state: SystemState) => {
      const updated = state.polls.filter((p: SystemPoll) => p.id !== id);
      saveStore({ ...state, polls: updated });
      return { polls: updated };
    });
  },

  // 4. External Contacts Actions
  addContact: (contactData: Omit<ExternalContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    set((state: SystemState) => {
      const now = Date.now();
      const newContact: ExternalContact = {
        ...contactData,
        id: 'cnt_' + now,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...state.contacts, newContact];
      SoundEngine.playPitchedSound(state.devicePrefs.soundPack, 450, 0.15, state.devicePrefs.soundVolume);
      saveStore({ ...state, contacts: updated });
      return { contacts: updated };
    });
  },

  updateContact: (id: string, updates: Partial<ExternalContact>) => {
    set((state: SystemState) => {
      const updated = state.contacts.map((c: ExternalContact) =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      );
      saveStore({ ...state, contacts: updated });
      return { contacts: updated };
    });
  },

  deleteContact: (id: string) => {
    set((state: SystemState) => {
      const updated = state.contacts.filter((c: ExternalContact) => c.id !== id);
      saveStore({ ...state, contacts: updated });
      return { contacts: updated };
    });
  },

  updateAlterContactComfort: (contactId: string, alterId: string, comfort: AlterComfortLevel, isOutTo: boolean, notes?: string) => {
    set((state: SystemState) => {
      const updated = state.contacts.map((c: ExternalContact) => {
        if (c.id !== contactId) return c;
        const currentRel = c.alterRelationships[alterId] || { alterId, comfortLevel: 'unknown', isOutTo: false };
        const updatedRels = {
          ...c.alterRelationships,
          [alterId]: {
            ...currentRel,
            comfortLevel: comfort,
            isOutTo,
            notes: notes !== undefined ? notes : currentRel.notes,
          },
        };
        return {
          ...c,
          alterRelationships: updatedRels,
          updatedAt: Date.now(),
        };
      });
      saveStore({ ...state, contacts: updated });
      return { contacts: updated };
    });
  },

  // QR / Offline Sync Engine
  openQrSyncModal: () => set({ isQrSyncModalOpen: true }),
  closeQrSyncModal: () => set({ isQrSyncModalOpen: false }),

  exportAllData: () => {
    const state = get();
    const payload = {
      system: state.system,
      alters: state.alters,
      activeFronts: state.activeFronts,
      frontLogs: state.frontLogs,
      boards: state.boards,
      widgets: state.widgets,
      tasks: state.tasks,
      channels: state.channels,
      messages: state.messages,
      bodyNeeds: state.bodyNeeds,
      webhooks: state.webhooks,
      playlists: state.playlists,
      rules: state.rules,
      polls: state.polls,
      contacts: state.contacts,
      devicePrefs: state.devicePrefs,
      exportedAt: Date.now(),
      appVersion: '2.0',
    };
    return JSON.stringify(payload);
  },

  importAllData: (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.system || !parsed.alters) {
        return false;
      }
      set({
        system: parsed.system,
        alters: parsed.alters,
        activeFronts: parsed.activeFronts || [],
        frontLogs: parsed.frontLogs || [],
        boards: parsed.boards || [],
        widgets: parsed.widgets || [],
        tasks: parsed.tasks || [],
        channels: parsed.channels || [],
        messages: parsed.messages || [],
        bodyNeeds: parsed.bodyNeeds || get().bodyNeeds,
        webhooks: parsed.webhooks || [],
        playlists: parsed.playlists || [],
        rules: parsed.rules || [],
        polls: parsed.polls || [],
        contacts: parsed.contacts || [],
        devicePrefs: parsed.devicePrefs || get().devicePrefs,
      });
      saveStore(get());
      return true;
    } catch (e) {
      console.error('Failed to parse import data', e);
      return false;
    }
  },

  // Switch-In Handoff Briefing
  openBriefingModal: (alterId: string) => set({ isBriefingModalOpen: true, briefingAlterId: alterId }),
  closeBriefingModal: () => set({ isBriefingModalOpen: false, briefingAlterId: null }),
}));

function saveStore(state: any) {
  try {
    const toSave = {
      system: state.system,
      alters: state.alters,
      activeFronts: state.activeFronts,
      frontLogs: state.frontLogs,
      activeBoardId: state.activeBoardId,
      boards: state.boards,
      widgets: state.widgets,
      tasks: state.tasks,
      activeChannelId: state.activeChannelId,
      channels: state.channels,
      messages: state.messages,
      bodyNeeds: state.bodyNeeds,
      webhooks: state.webhooks,
      playlists: state.playlists,
      rules: state.rules,
      polls: state.polls,
      contacts: state.contacts,
      devicePrefs: state.devicePrefs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

