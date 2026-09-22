// System & Core Identity
export interface System {
  id: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type AlterRole =
  | 'Host'
  | 'Co-Host'
  | 'Protector'
  | 'Caretaker'
  | 'Gatekeeper'
  | 'Little'
  | 'Internal Self Helper (ISH)'
  | 'Memory Holder'
  | 'Social'
  | 'Academic / Work'
  | 'Persecutor / Reformed'
  | 'Fragment'
  | 'Other';

export interface SensoryAnchors {
  switchTriggers?: string[];  // Positive switch triggers (music, sensory, topics)
  positiveTriggers: string[]; // Calming scents, sounds, items, grounding phrases
  distressTriggers: string[]; // Triggers to avoid / sensory overloads
}

export interface Alter {
  id: string;
  systemId: string;
  name: string;
  pronouns: string[];
  colorHex: string;
  avatarUrl?: string;
  roles: AlterRole[];
  ageAppearance?: string;
  description?: string;
  sensoryAnchors: SensoryAnchors;
  isVaultLocked: boolean; // Requires alter-specific PIN
  pinCode?: string; // Stored hashed or local PIN
  allowExternalBroadcast: boolean; // Opt-in for Discord / webhook broadcast
  createdAt: number;
  updatedAt: number;
}

// Fronting Tracker
export type FrontStatus = 'front' | 'co-front' | 'co-conscious' | 'lurking' | 'away';

export interface FrontMember {
  alterId: string;
  status: FrontStatus;
  startedAt: number;
}

export interface FrontLog {
  id: string;
  systemId: string;
  alterId: string;
  status: FrontStatus;
  startedAt: number;
  endedAt?: number;
  energyLevel?: number; // 1-10
  notes?: string;
  triggerSwitchEvent?: string;
}

// Corkboard & Widgets
export type BoardScope = 'common' | 'alter_private';
export type BoardTheme = 'cork' | 'slate' | 'whiteboard';

export interface Board {
  id: string;
  systemId: string;
  scope: BoardScope;
  ownerAlterId?: string; // Defined if alter_private
  title: string;
  theme: BoardTheme;
  createdAt: number;
}

export type WidgetType =
  | 'sticky_note'
  | 'checklist'
  | 'urgent_ribbon'
  | 'rule_card'
  | 'voice_memo'
  | 'photo_pin';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface BoardWidget {
  id: string;
  boardId: string;
  authorAlterId: string;
  type: WidgetType;
  position: { x: number; y: number; zIndex: number; rotation?: number };
  size: { width: number; height: number };
  color: string;
  title?: string;
  content?: string;
  checklistItems?: ChecklistItem[];
  audioUrl?: string;
  audioDurationSec?: number;
  imageUrl?: string;
  urgencyLevel?: 'low' | 'normal' | 'urgent' | 'critical';
  isPinned: boolean;
  isLocked?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Task Delegation Engine
export type TaskNegotiationStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'needs_handoff'
  | 'deferred';

export interface TaskHandoffEvent {
  id: string;
  taskId: string;
  fromAlterId: string;
  toAlterId?: string;
  action: 'requested' | 'accepted' | 'declined' | 'handoff_requested' | 'completed' | 'reassigned';
  notes?: string;
  timestamp: number;
}

export interface Task {
  id: string;
  systemId: string;
  creatorAlterId: string;
  assignedAlterId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: number;
  preferredFrontTimeWindow?: string; // e.g., "Wednesday afternoon", "Next time fronting"
  status: TaskNegotiationStatus;
  declineReason?: string;
  suggestedReassignmentAlterId?: string;
  isPrivate: boolean;
  corkboardWidgetId?: string;
  handoffHistory: TaskHandoffEvent[];
  createdAt: number;
  updatedAt: number;
}

// Inner Messaging / Chat
export type ChannelType = 'general' | 'topic' | 'dm';

export interface Channel {
  id: string;
  systemId: string;
  type: ChannelType;
  name: string; // e.g. "System General", "#finances", "#therapy"
  description?: string;
  participantAlterIds?: string[]; // for DMs
  iconName?: string;
  createdAt: number;
}

export interface InnerMessage {
  id: string;
  channelId: string;
  senderAlterId: string;
  content: string;
  audioUrl?: string;
  audioDurationSec?: number;
  pinnedToBoardId?: string;
  createdAt: number;
}

// Body Care & Grounding
export interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string; // e.g. "Morning", "Night", "As Needed"
  takenToday: boolean;
  lastTakenAt?: number;
  takenByAlterId?: string;
}

export interface BodyNeedsMeter {
  energyScore: number;       // 1 - 10
  hydrationScore: number;    // 1 - 10
  sensoryOverloadScore: number; // 1 - 10
  lastMealTime?: number;
  lastWaterTime?: number;
  medications: MedicationRecord[];
  lastDailyResetDate?: string; // e.g. "2026-09-22"
  updatedAt: number;
  updatedByAlterId?: string;
}

export interface GroundingStep {
  count: number;
  sense: string;
  description: string;
  items: string[];
}

// Webhook & External Switch Broadcaster
export type WebhookPreset = 'discord_webhook' | 'pluralkit' | 'custom_json';

export interface SwitchWebhookConfig {
  id: string;
  systemId: string;
  isEnabled: boolean;
  name: string;
  preset: WebhookPreset;
  url: string;
  secretToken?: string;
  customHeaders?: string; // JSON string
  customPayloadTemplate?: string;
  triggerOnEvents: ('front_changed' | 'co_front_changed')[];
  lastTriggeredAt?: number;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
}

// Grounding Audio & Music Playlists
export type MusicPlatform = 'spotify' | 'youtube' | 'apple_music' | 'ambient';

export interface GroundingPlaylist {
  id: string;
  systemId: string;
  title: string;
  platform: MusicPlatform;
  url: string;
  embedUrl?: string;
  customAlterId?: string; // If specific alter playlist
  tags?: string[]; // e.g. "432Hz", "Binaural", "Lo-Fi", "Lullaby"
  description?: string;
  createdAt: number;
}

// Device & Audio Preferences (Customizable per Device)
export type SoundPack = 'chimes' | 'wood_taps' | 'subtle_clicks' | 'ethereal';
export type AppViewMode = 'auto' | 'desktop' | 'mobile';

export interface DevicePreferences {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  soundPack: SoundPack;
  hapticsEnabled: boolean;
  viewMode: AppViewMode;
}

// 2. System Codex & Agreements
export type RuleCategory =
  | 'safety'
  | 'finances'
  | 'fronting'
  | 'health'
  | 'inner_world'
  | 'general';

export type RuleSeverity = 'critical' | 'standard' | 'guideline';

export interface RuleAcknowledgement {
  alterId: string;
  acknowledged: boolean;
  timestamp: number;
  comment?: string;
}

export interface SystemRule {
  id: string;
  systemId: string;
  title: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  creatorAlterId: string;
  isLocked?: boolean;
  acknowledgements: Record<string, RuleAcknowledgement>; // key is alterId
  createdAt: number;
  updatedAt: number;
}

// 3. Internal Consensus & Polls Engine
export type PollCategory = 'general' | 'appearance' | 'financial' | 'social' | 'schedule' | 'inner_world';

export interface PollOption {
  id: string;
  text: string;
  color?: string;
}

export interface PollVote {
  alterId: string;
  optionId: string;
  timestamp: number;
  comment?: string;
  isVeto?: boolean;
}

export interface SystemPoll {
  id: string;
  systemId: string;
  title: string;
  description?: string;
  category: PollCategory;
  creatorAlterId: string;
  options: PollOption[];
  allowVeto: boolean;
  status: 'active' | 'resolved' | 'archived';
  resolvedOptionId?: string;
  expiresAt?: number;
  votes: Record<string, PollVote>; // key is alterId
  createdAt: number;
  updatedAt: number;
}

// 4. External Contacts & Masking Matrix
export type DisclosureLevel = 'fully_out' | 'partially_out' | 'covert_only';
export type ContactRelationshipType =
  | 'Partner'
  | 'Friend'
  | 'Family'
  | 'Therapist / Medical'
  | 'Coworker'
  | 'Acquaintance'
  | 'Other';

export type AlterComfortLevel = 'comfortable' | 'cautious' | 'avoid' | 'neutral' | 'unknown';

export interface AlterContactRelationship {
  alterId: string;
  comfortLevel: AlterComfortLevel;
  isOutTo: boolean; // Does this person know this specific alter?
  notes?: string;
}

export interface ExternalContact {
  id: string;
  systemId: string;
  name: string;
  relationship: ContactRelationshipType;
  disclosureLevel: DisclosureLevel;
  maskingPersona?: string; // e.g. "Act as Alex / Host persona"
  avatarColor?: string;
  phoneOrContact?: string;
  safetyNotes?: string;
  alterRelationships: Record<string, AlterContactRelationship>; // key is alterId
  createdAt: number;
  updatedAt: number;
}

// 7. Therapist & Clinical Session Report
export interface ClinicalReportConfig {
  dateRangeDays: number; // 7, 30, 90, or custom
  includeFrontDistribution: boolean;
  includeBodyMetrics: boolean;
  includeMedications: boolean;
  includeTriggers: boolean;
  includeSystemRulesSummary: boolean;
  anonymizeAlterNames: boolean; // Replaces names with "Alter #1 (Host)", etc.
}

