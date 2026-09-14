import React, { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { Channel } from '../../types';
import {
  Send,
  Mic,
  Square,
  Pin,
  Plus,
  Hash,
  User,
  Play,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Trash2,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  { name: 'daily-journal', desc: 'Reflections and day log' },
  { name: 'therapy-notes', desc: 'Prep and post-session notes' },
  { name: 'finances-budget', desc: 'Expenses and money decisions' },
  { name: 'safe-venting', desc: 'Safe space to release emotions' },
  { name: 'front-notes', desc: 'Quick handoffs and reminders' },
  { name: 'agreements', desc: 'Shared system discussions' },
];

export const InnerChat: React.FC = () => {
  const {
    channels,
    activeChannelId,
    setActiveChannelId,
    messages,
    sendMessage,
    pinMessageToBoard,
    activeBoardId,
    alters,
    activeFronts,
    addChannel,
    deleteChannel,
    deleteMessage,
    clearChannelMessages,
    system,
    devicePrefs,
  } = useSystemStore();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile =
    devicePrefs.viewMode === 'mobile' ||
    (devicePrefs.viewMode === 'auto' && windowWidth < 768);

  // Mobile navigation state: false = channel list, true = active chat
  const [mobileShowChat, setMobileShowChat] = useState(!isMobile);

  const mainFrontId = activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';
  const [senderAlterId, setSenderAlterId] = useState<string>(mainFrontId);
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Modals & Confirmation States
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'topic' | 'dm' | 'general'>('topic');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [selectedDmAlterIds, setSelectedDmAlterIds] = useState<string[]>([]);

  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === currentChannel?.id);
  const currentSender = alters.find((a) => a.id === senderAlterId) || alters[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, mobileShowChat]);

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    if (isMobile) {
      setMobileShowChat(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentChannel) return;

    sendMessage(currentChannel.id, senderAlterId, inputText.trim());
    setInputText('');
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  };

  const handleStopVoiceRecording = () => {
    clearInterval(timerRef.current);
    setIsRecordingVoice(false);
    const duration = recordingSeconds > 0 ? recordingSeconds : 8;

    if (currentChannel) {
      sendMessage(
        currentChannel.id,
        senderAlterId,
        `🎙️ Audio Voice Note (${duration}s)`,
        'mock_audio_blob_url',
        duration
      );
    }
    setRecordingSeconds(0);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = newChannelName.trim();
    if (!finalName && newChannelType === 'dm') {
      const names = selectedDmAlterIds
        .map((id) => alters.find((a) => a.id === id)?.name)
        .filter(Boolean);
      finalName = names.length > 0 ? `@${names.join(' & ')}` : '@Direct Message';
    }

    if (!finalName) return;

    let formattedName = finalName;
    if (newChannelType === 'topic' && !formattedName.startsWith('#')) {
      formattedName = `#${formattedName}`;
    } else if (newChannelType === 'dm' && !formattedName.startsWith('@')) {
      formattedName = `@${formattedName}`;
    }

    addChannel({
      systemId: system.id,
      type: newChannelType,
      name: formattedName,
      description: newChannelDesc.trim() || (newChannelType === 'dm' ? 'Private thread' : `Inner thread created by ${currentSender?.name}`),
      participantAlterIds: newChannelType === 'dm' ? selectedDmAlterIds : undefined,
    });

    setNewChannelName('');
    setNewChannelDesc('');
    setSelectedDmAlterIds([]);
    setIsAddChannelOpen(false);
  };

  const handleConfirmDeleteChannel = () => {
    if (!channelToDelete) return;
    deleteChannel(channelToDelete.id);
    setChannelToDelete(null);
  };

  const toggleDmAlter = (alterId: string) => {
    setSelectedDmAlterIds((prev) =>
      prev.includes(alterId) ? prev.filter((id) => id !== alterId) : [...prev, alterId]
    );
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden relative">
      {/* Channels List (Shown as sidebar on desktop, or full screen list on mobile when !mobileShowChat) */}
      {(!isMobile || !mobileShowChat) && (
        <div
          className={`${
            isMobile ? 'w-full' : 'w-72 border-r border-slate-800'
          } bg-slate-900/95 flex flex-col justify-between shrink-0 h-full select-none`}
        >
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                  Inner Channels
                </h2>
                <p className="text-[11px] text-slate-400">Internal communication & DMs</p>
              </div>
              <button
                onClick={() => {
                  setNewChannelName('');
                  setNewChannelDesc('');
                  setSelectedDmAlterIds([]);
                  setIsAddChannelOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                title="Add Channel or Topic"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>

            {/* Channels List */}
            {channels.length === 0 ? (
              <div className="p-6 text-center space-y-3 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No channels yet.</p>
                <button
                  onClick={() => setIsAddChannelOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create Channel
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {channels.map((channel) => {
                  const isActive = channel.id === currentChannel?.id;
                  const lastMsg = messages
                    .filter((m) => m.channelId === channel.id)
                    .slice(-1)[0];
                  const lastSender = lastMsg ? alters.find((a) => a.id === lastMsg.senderAlterId) : null;

                  return (
                    <div
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel.id)}
                      className={`group w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all cursor-pointer ${
                        isActive && !isMobile
                          ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden text-left flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            channel.type === 'general'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : channel.type === 'dm'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {channel.type === 'general' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : channel.type === 'dm' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Hash className="w-4 h-4" />
                          )}
                        </div>

                        <div className="overflow-hidden flex-1 min-w-0">
                          <div className="font-bold truncate text-slate-100">{channel.name}</div>
                          {lastMsg ? (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              <span className="font-semibold text-slate-300">
                                {lastSender?.name || 'Alter'}:{' '}
                              </span>
                              {lastMsg.content}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">No messages yet</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Delete Channel Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChannelToDelete(channel);
                          }}
                          className={`p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-all ${
                            isActive ? 'text-indigo-200 hover:text-white hover:bg-indigo-700' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title={`Delete ${channel.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {isMobile && <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sender Identity Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Speaking As (Identity)
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                style={{ backgroundColor: currentSender?.colorHex || '#6366f1' }}
              >
                {currentSender?.name.slice(0, 1)}
              </div>
              <select
                value={senderAlterId}
                onChange={(e) => setSenderAlterId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                {alters.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.roles.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Conversation Area (Shown when !isMobile or mobileShowChat === true) */}
      {(!isMobile || mobileShowChat) && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden h-full bg-slate-950">
          {currentChannel ? (
            <>
              {/* Channel Topbar */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 z-10 shrink-0">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* Mobile Back to Channels Button */}
                  {isMobile && (
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="p-1.5 -ml-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5 text-indigo-400" />
                      <span className="hidden sm:inline">Channels</span>
                    </button>
                  )}

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 truncate">
                        {currentChannel.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {channelMessages.length} msgs
                      </span>
                    </div>
                    {currentChannel.description && (
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentChannel.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Topbar Actions & Quick Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Clear Messages */}
                  {channelMessages.length > 0 && (
                    <button
                      onClick={() => setIsClearConfirmOpen(true)}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                      title="Clear messages in this channel"
                    >
                      <span>Clear</span>
                    </button>
                  )}

                  {/* Delete Channel Button */}
                  <button
                    onClick={() => setChannelToDelete(currentChannel)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title={`Delete channel ${currentChannel.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-slate-800 hidden sm:block" />

                  {/* Quick Alter Switcher */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">As:</span>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: currentSender?.colorHex || '#6366f1' }}
                    >
                      {currentSender?.name.slice(0, 1)}
                    </div>
                    <select
                      value={senderAlterId}
                      onChange={(e) => setSenderAlterId(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold focus:outline-none max-w-[120px] truncate"
                    >
                      {alters.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
                {channelMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 p-8 text-center">
                    <MessageCircle className="w-10 h-10 text-slate-700" />
                    <p className="text-xs font-semibold text-slate-400">
                      No messages in {currentChannel.name} yet
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Say hi or leave a voice note for the system below.
                    </p>
                  </div>
                ) : (
                  channelMessages.map((msg) => {
                    const sender = alters.find((a) => a.id === msg.senderAlterId);
                    const isMe = msg.senderAlterId === senderAlterId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 group ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Alter Avatar */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner relative overflow-hidden"
                          style={{ backgroundColor: sender?.colorHex || '#6366f1' }}
                        >
                          {sender?.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            sender?.name.slice(0, 1).toUpperCase() || 'A'
                          )}
                        </div>

                        {/* Message Bubble Container */}
                        <div
                          className={`max-w-[82%] sm:max-w-md space-y-1 ${
                            isMe ? 'items-end text-right' : 'items-start'
                          }`}
                        >
                          {/* Author line */}
                          <div
                            className={`flex items-center gap-1.5 text-[11px] ${
                              isMe ? 'justify-end' : ''
                            }`}
                          >
                            <span className="font-bold text-slate-300">
                              {sender?.name || 'Alter'}
                            </span>
                            <span className="text-slate-500 text-[9px]">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Bubble Content */}
                          <div
                            className={`p-3 rounded-2xl text-xs relative transition-all inline-block text-left ${
                              isMe
                                ? 'bg-indigo-600 text-white shadow-md rounded-tr-xs'
                                : 'bg-slate-900 text-slate-100 border border-slate-800 shadow-md rounded-tl-xs'
                            }`}
                          >
                            {/* Audio Note Player */}
                            {msg.audioUrl ? (
                              <div className="flex items-center gap-3 py-1">
                                <button
                                  onClick={() =>
                                    setPlayingMessageId(
                                      playingMessageId === msg.id ? null : msg.id
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all shrink-0"
                                >
                                  {playingMessageId === msg.id ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4 ml-0.5" />
                                  )}
                                </button>
                                <div>
                                  <div className="flex items-center gap-1 h-3">
                                    {[40, 70, 25, 90, 50, 80, 60, 30, 95, 45, 85, 30].map(
                                      (h, i) => (
                                        <div
                                          key={i}
                                          className={`w-1 rounded-full ${
                                            playingMessageId === msg.id
                                              ? 'bg-amber-300 animate-pulse'
                                              : 'bg-white/60'
                                          }`}
                                          style={{ height: `${h}%` }}
                                        />
                                      )
                                    )}
                                  </div>
                                  <span className="text-[10px] text-white/80 font-mono mt-0.5 block">
                                    0:{msg.audioDurationSec?.toString().padStart(2, '0') || '15'}{' '}
                                    Voice Memo
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                            )}

                            {/* Message Hover Actions (Pin & Delete) */}
                            <div
                              className={`absolute top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ${
                                isMe ? '-left-14' : '-right-14'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  pinMessageToBoard(msg.id, activeBoardId);
                                  alert('Message pinned to Corkboard!');
                                }}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors shadow"
                                title="Pin to Corkboard"
                              >
                                <Pin className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors shadow"
                                title="Delete Message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 shrink-0">
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 animate-pulse text-xs text-rose-200">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-rose-400" />
                      <span>
                        Recording: <strong>0:{recordingSeconds.toString().padStart(2, '0')}</strong>
                      </span>
                    </div>
                    <button
                      onClick={handleStopVoiceRecording}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Post Memo</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartVoiceRecording}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 transition-colors shrink-0"
                      title="Record Voice Note"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message ${currentChannel.name} as ${currentSender?.name || 'Alter'}...`}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/20 transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-slate-100">No Inner Channels Available</h3>
                <p className="text-xs text-slate-400">
                  Create a topic thread, direct message, or general room to start chatting with your system members.
                </p>
              </div>
              <button
                onClick={() => setIsAddChannelOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Channel</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Channel Modal */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New Inner Channel</span>
              </h3>
              <button
                onClick={() => setIsAddChannelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Channel Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('topic')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      newChannelType === 'topic'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span>Topic (#)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('dm')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      newChannelType === 'dm'
                        ? 'bg-pink-600/20 border-pink-500 text-pink-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>DM (@)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('general')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      newChannelType === 'general'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>General</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Channel Name *
                </label>
                <input
                  type="text"
                  required={newChannelType !== 'dm'}
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder={
                    newChannelType === 'topic'
                      ? 'e.g. finances, therapy, reminders'
                      : newChannelType === 'dm'
                      ? 'e.g. Alex & Sam (or select alters below)'
                      : 'e.g. System Announcements'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Topic Quick Suggestions */}
              {newChannelType === 'topic' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Suggested Topics
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TOPICS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setNewChannelName(item.name);
                          setNewChannelDesc(item.desc);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      >
                        #{item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DM Alters Picker */}
              {newChannelType === 'dm' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Participating Alters
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
                    {alters.map((alter) => {
                      const isSelected = selectedDmAlterIds.includes(alter.id);
                      return (
                        <button
                          key={alter.id}
                          type="button"
                          onClick={() => toggleDmAlter(alter.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left border transition-all ${
                            isSelected
                              ? 'bg-pink-950/40 border-pink-500 text-pink-200 shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: alter.colorHex }}
                          >
                            {alter.name.slice(0, 1)}
                          </div>
                          <span className="truncate flex-1">{alter.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic / Purpose Description (Optional)
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="e.g. Dedicated space for daily reflections and triggers..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Channel Confirmation Modal */}
      {channelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">
                Delete Channel "{channelToDelete.name}"?
              </h3>
              <p className="text-xs text-slate-400">
                This will permanently delete this inner chat channel and all{' '}
                <strong className="text-slate-200">
                  {messages.filter((m) => m.channelId === channelToDelete.id).length}
                </strong>{' '}
                message(s) inside it.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChannel}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all"
              >
                Delete Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Messages Confirmation Modal */}
      {isClearConfirmOpen && currentChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">
                Clear Messages in "{currentChannel.name}"?
              </h3>
              <p className="text-xs text-slate-400">
                This will delete all {channelMessages.length} message(s) in this channel while keeping the channel room open.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearChannelMessages(currentChannel.id);
                  setIsClearConfirmOpen(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all"
              >
                Clear Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
