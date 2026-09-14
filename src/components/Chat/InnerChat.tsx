import React, { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import {
  MessageSquare,
  Send,
  Mic,
  Square,
  Pin,
  Plus,
  Lock,
  Hash,
  User,
  Volume2,
  Play,
  Pause,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

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
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'topic' | 'dm'>('topic');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === currentChannel?.id);
  const currentSender = alters.find((a) => a.id === senderAlterId);

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
    if (!inputText.trim()) return;

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

    sendMessage(
      currentChannel.id,
      senderAlterId,
      `🎙️ Audio Voice Note (${duration}s)`,
      'mock_audio_blob_url',
      duration
    );
    setRecordingSeconds(0);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    addChannel({
      systemId: system.id,
      type: newChannelType,
      name: newChannelType === 'topic' ? `#${newChannelName.replace(/^#/, '')}` : newChannelName,
      description: `Inner thread created by ${currentSender?.name}`,
    });

    setNewChannelName('');
    setIsAddChannelOpen(false);
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
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                  Inner Channels
                </h2>
                <p className="text-[11px] text-slate-400">Internal communication & DMs</p>
              </div>
              <button
                onClick={() => setIsAddChannelOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                title="Add Channel or Topic"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>

            {/* Channels List */}
            <div className="space-y-1.5">
              {channels.map((channel) => {
                const isActive = channel.id === currentChannel?.id;
                const lastMsg = messages
                  .filter((m) => m.channelId === channel.id)
                  .slice(-1)[0];
                const lastSender = lastMsg ? alters.find((a) => a.id === lastMsg.senderAlterId) : null;

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all ${
                      isActive && !isMobile
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
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

                      <div className="overflow-hidden">
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

                    {isMobile && <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
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
                    {currentChannel?.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {channelMessages.length} msgs
                  </span>
                </div>
                {currentChannel?.description && (
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentChannel.description}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Alter Switcher on Chat Topbar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">As:</span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
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

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {channelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 p-8 text-center">
                <MessageCircle className="w-10 h-10 text-slate-700" />
                <p className="text-xs font-semibold text-slate-400">
                  No messages in {currentChannel?.name} yet
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

                        {/* Pin to Corkboard Action */}
                        <button
                          onClick={() => {
                            pinMessageToBoard(msg.id, activeBoardId);
                            alert('Message pinned to Corkboard!');
                          }}
                          className={`absolute top-2 -right-7 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-all ${
                            isMe ? '-left-7 -right-auto' : ''
                          }`}
                          title="Pin Message to Corkboard"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
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
                  placeholder={`Message #${currentChannel?.name || 'chat'} as ${currentSender?.name || 'Alter'}...`}
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
        </div>
      )}

      {/* Add Channel Modal */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Create New Channel / Topic</h3>
            <form onSubmit={handleCreateChannel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. finances, recipes, therapy"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="topic">Topic Thread (#)</option>
                  <option value="dm">Direct Message Thread</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
