"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useERPAuth, apiClient, API } from "@/src/components/erp/ERPAuthContext";
import { Search, Send, Image as ImageIcon, Users, User, Plus, X, MoreVertical, Check, CheckCheck, Reply, Forward, Smile, Pencil, Mic, StopCircle, Trash2, Play, Pause, Paperclip, Camera } from "lucide-react";
import { format } from "date-fns";

interface ReplyInfo {
  id: string;
  content: string;
  sender_name: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  recipient_id: string;
  content: string;
  is_group: boolean;
  attachments: string[];
  status: string;
  created_at: string;
  reply_to?: ReplyInfo;
  is_forwarded?: boolean;
}

interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  description?: string;
  admin_id: string;
  created_by?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  teams: string[];
  is_online: boolean;
}

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😅","🙏","👍","👎","❤️","🔥","🎉","✅","⚡",
  "😢","😡","🤣","😇","🥳","😴","🤯","😱","😭","🫡","💪","🙌","👏","🤝","✌️",
  "💯","🚀","⭐","💡","📌","🎯","💬","📢","🔔","💰","📊","📈","🛡️","⚙️","🔑",
];

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ERPVoicePlayer = ({ src, isMe }: { src: string, isMe?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Generate 25 vertical bars with pseudo-random heights (based on hash of src)
  const bars = useMemo(() => {
    const hash = src.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return Array.from({ length: 28 }, (_, i) => {
      const h = 5 + Math.abs(Math.sin(hash + i) * 15);
      return h;
    });
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const progress = (currentTime / (duration || 1)) * 100;

  return (
    <div className={`flex items-center gap-3 w-full sm:max-w-[320px] ${isMe ? 'bg-[#005c4b]' : 'bg-[#202c33]'} p-1.5 px-3 rounded-xl group transition-all my-1`}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <div className="relative shrink-0">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col pt-1">
        <div className="relative h-6 w-full flex items-center gap-[2px]">
          {bars.map((h, i) => {
            const barProgress = (i / bars.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <div 
                key={i}
                className="w-0.5 rounded-full transition-colors duration-150"
                style={{ 
                  height: `${h}px`, 
                  backgroundColor: isActive ? '#53bdeb' : (isMe ? '#aebac1' : '#8696a0'),
                  opacity: isActive ? 1 : 0.5
                }}
              />
            );
          })}
          
          <input 
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = val;
              setCurrentTime(val);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default function ERPChatPage() {
  const { user, token } = useERPAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; isGroup: boolean; avatar?: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [replyToMsg, setReplyToMsg] = useState<ChatMessage | null>(null);
  const [forwardMsg, setForwardMsg] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragXOffset, setDragXOffset] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const holdTimerRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef(activeChat);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat) {
      setUnreadCounts(prev => ({ ...prev, [activeChat.id]: 0 }));
      fetchMessages(activeChat.id, activeChat.isGroup);
      if (!activeChat.isGroup) markAsSeen(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    }
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) fetchInitialData();
  }, [token]);

  // Global WebSocket Event Listeners
  useEffect(() => {
    const handleWS = (e: any) => {
      const msg = e.detail;
      if (msg.type === "chat_message") {
        const newMsg: ChatMessage = msg.data;
        const currentChat = activeChatRef.current;
        audioRef.current?.play().catch(() => {});
        
        const isCurrentChat = currentChat && (
          (newMsg.is_group && newMsg.recipient_id === currentChat.id) ||
          (!newMsg.is_group && (newMsg.sender_id === currentChat.id || newMsg.recipient_id === currentChat.id))
        );
        
        if (isCurrentChat) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (!newMsg.is_group && newMsg.sender_id === currentChat!.id) {
            // Small delay to ensure DB indexing and UI rendering
            setTimeout(() => markAsSeen(currentChat!.id), 1000);
          }
        } else {
          const targetId = newMsg.is_group ? newMsg.recipient_id : newMsg.sender_id;
          setUnreadCounts(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
        }
      } else if (msg.type === "chat_status_update") {
        setMessages(prev => prev.map(m => m.id === msg.data.message_id ? { ...m, status: msg.data.status } : m));
      } else if (msg.type === "chat_group_created") {
        setGroups(prev => [...prev, msg.data]);
      } else if (msg.type === "user_online") {
        setMembers(prev => prev.map(m => m.id === msg.data.user_id ? { ...m, is_online: true } : m));
      } else if (msg.type === "user_offline") {
        setMembers(prev => prev.map(m => m.id === msg.data.user_id ? { ...m, is_online: false } : m));
      }
    };

    window.addEventListener("erp:chat_message" as any, handleWS);
    window.addEventListener("erp:chat_status_update" as any, handleWS);
    window.addEventListener("erp:chat_group_created" as any, handleWS);
    window.addEventListener("erp:user_online" as any, handleWS);
    window.addEventListener("erp:user_offline" as any, handleWS);
    
    return () => {
      window.removeEventListener("erp:chat_message" as any, handleWS);
      window.removeEventListener("erp:chat_status_update" as any, handleWS);
      window.removeEventListener("erp:chat_group_created" as any, handleWS);
      window.removeEventListener("erp:user_online" as any, handleWS);
      window.removeEventListener("erp:user_offline" as any, handleWS);
    };
  }, [user]);

  // Auto-stop other audios when one starts
  useEffect(() => {
    const handlePlay = (e: Event) => {
      const audios = document.getElementsByTagName('audio');
      for (let i = 0; i < audios.length; i++) {
        if (audios[i] !== e.target) {
          audios[i].pause();
        }
      }
    };
    document.addEventListener('play', handlePlay, true);
    return () => document.removeEventListener('play', handlePlay, true);
  }, []);

  const getUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API}${path}`;
  };
  const markAsSeen = async (convoId: string) => {
    try { await apiClient.patch(`/api/erp/chat/messages/status`, { conversation_id: convoId, status: "seen" }, { headers: h }); }
    catch (e) { console.error(e); }
  };

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [mRes, gRes] = await Promise.all([
        apiClient.get("/api/erp/members?allow_all=true", { headers: h }),
        apiClient.get("/api/erp/chat/groups", { headers: h })
      ]);
      setMembers(mRes.data.filter((m: any) => m.id !== user?.id));
      setGroups(gRes.data);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  };

  const fetchMessages = async (id: string, isGroup: boolean) => {
    setLoadingMessages(true);
    try {
      const res = await apiClient.get(`/api/erp/chat/messages?recipient_id=${id}&is_group=${isGroup}`, { headers: h });
      setMessages(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingMessages(false); }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  const handleSendMessage = async (e?: React.FormEvent, attachments: string[] = []) => {
    e?.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    if (!activeChat) return;
    const payload: any = {
      recipient_id: activeChat.id,
      content: inputText,
      is_group: activeChat.isGroup,
      attachments,
    };
    if (replyToMsg) payload.reply_to_id = replyToMsg.id;
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/erp/chat/messages", payload, { headers: h });
      setMessages(prev => [...prev, res.data]);
      setInputText("");
      setReplyToMsg(null);
      setShowEmojiPicker(false);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleForwardSend = async (targetId: string, isGroup: boolean) => {
    if (!forwardMsg) return;
    try {
      const payload = {
        recipient_id: targetId,
        content: forwardMsg.content,
        is_group: isGroup,
        attachments: forwardMsg.attachments || [],
        is_forwarded: true,
      };
      const res = await apiClient.post("/api/erp/chat/messages", payload, { headers: h });
      // If the forwarded target is the currently open chat, show the message immediately
      if (activeChat && targetId === activeChat.id && isGroup === activeChat.isGroup) {
        setMessages(prev => [...prev, res.data]);
      }
      setForwardMsg(null);
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient.post("/api/erp/chat/upload", fd, {
        headers: { ...h, "Content-Type": "multipart/form-data" }
      });
      handleSendMessage(undefined, [res.data.url]);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  // Voice Recording Logic
  const startRecording = (e: React.PointerEvent) => {
    // Prevent starting if already recording
    if (isRecording || holdTimerRef.current) return;
    
    // Capture the pointer so we get move/up events even if the mouse leaves the button
    const target = e.currentTarget as HTMLButtonElement;
    try { target.setPointerCapture(e.pointerId); } catch (err) { console.warn(err); }

    dragStartXRef.current = e.clientX;
    isCancelledRef.current = false;
    setDragXOffset(0);

    // Set a small delay (200ms) to distinguish between a tap and a hold
    holdTimerRef.current = setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        startTimeRef.current = Date.now();
   
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
   
        recorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Audio recording error:", err);
        alert("Microphone access denied or error occurred.");
        holdTimerRef.current = null;
        try { target.releasePointerCapture(e.pointerId); } catch (e) {}
      }
    }, 200);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRecording && !holdTimerRef.current) return;
    
    const currentX = e.clientX;
    const diff = currentX - dragStartXRef.current;
    
    // We only care about sliding LEFT (negative diff)
    if (diff < 0) {
      setDragXOffset(diff);
      
      // If slid more than 120px, cancel
      if (Math.abs(diff) > 120) {
        if (isRecording) {
            cancelRecording();
            isCancelledRef.current = true;
        } else if (holdTimerRef.current) {
            // Cancelled before it even started
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
            isCancelledRef.current = true;
        }
      }
    }
  };

  const stopRecording = () => {
    // Clear any pending hold timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (recorderRef.current && isRecording) {
      const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
      const recorder = recorderRef.current;
      
      recorder.onstop = async () => {
        if (isCancelledRef.current || chunksRef.current.length === 0) {
            setDragXOffset(0);
            return;
        }
        
        if (durationSeconds < 1) {
          console.warn("Recording too short, ignored.");
          setDragXOffset(0);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", audioBlob, "recording.webm");
          const res = await apiClient.post("/api/erp/chat/upload", fd, {
            headers: { ...h, "Content-Type": "multipart/form-data" }
          });
          handleSendMessage(undefined, [res.data.url]);
        } catch (e) {
          console.error("Voice upload failed:", e);
        } finally {
          setUploading(false);
          setDragXOffset(0);
        }
      };
      
      recorder.stop();
      recorder.stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      recorderRef.current = null;
    }
    setIsRecording(false);
    setDragXOffset(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (recorderRef.current) {
      const recorder = recorderRef.current;
      recorder.onstop = null; 
      recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
      recorderRef.current = null;
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    try {
      const res = await apiClient.post("/api/erp/chat/groups", { name: newGroupName, members: selectedMembers }, { headers: h });
      setGroups(prev => [...prev, res.data]);
      setShowGroupModal(false);
      setNewGroupName("");
      setSelectedMembers([]);
    } catch (e) { console.error(e); }
  };

  const handleTransferAdmin = async (newAdminId: string) => {
    try {
      await apiClient.post(`/api/erp/chat/groups/${activeChat!.id}/transfer_admin`, { new_admin_id: newAdminId }, { headers: h });
      setGroups(prev => prev.map(g => g.id === activeChat!.id ? { ...g, admin_id: newAdminId } : g));
    } catch (e) {
      console.error(e);
      alert("Failed to transfer admin rights.");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await apiClient.post(`/api/erp/chat/groups/${activeChat!.id}/leave`, {}, { headers: h });
      setGroups(prev => prev.filter(g => g.id !== activeChat!.id));
      setActiveChat(null);
      setShowGroupSettings(false);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "Failed to leave group.");
    }
  };

  const handleUpdateGroup = async (name?: string, description?: string) => {
    try {
      const payload: any = {};
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;

      const res = await apiClient.patch(`/api/erp/chat/groups/${activeChat!.id}`, payload, { headers: h });
      setGroups(prev => prev.map(g => g.id === activeChat!.id ? res.data : g));
      if (payload.name) setActiveChat(prev => prev ? { ...prev, name: payload.name } : null);
    } catch (e) { console.error(e); }
  };

  const handleAddMembers = async (newMembers: string[]) => {
    try {
      const res = await apiClient.post(`/api/erp/chat/groups/${activeChat!.id}/add_members`, { new_members: newMembers }, { headers: h });
      setGroups(prev => prev.map(g => g.id === activeChat!.id ? res.data : g));
    } catch (e) { console.error(e); }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = inputText.slice(0, start) + emoji + inputText.slice(end);
      setInputText(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setInputText(prev => prev + emoji);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return {
      members: members.filter(m => m.name.toLowerCase().includes(q)),
      groups: groups.filter(g => g.name.toLowerCase().includes(q)),
    };
  }, [members, groups, searchQuery]);

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#0b141a] rounded-3xl border border-[#202c33]/50 overflow-hidden shadow-2xl">

      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-[#202c33]/50 flex-col bg-[#111b21] shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#202c33]/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Chat</h2>
            <button onClick={() => setShowGroupModal(true)} className="p-2 hover:bg-[#111] rounded-lg text-indigo-400 transition-colors" title="Create Group">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search people or groups..."
              className="w-full bg-[#111] border border-[#222] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingData ? (
             <div className="p-8 flex flex-col items-center justify-center text-gray-500 gap-3">
               <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading Contacts...</p>
             </div>
          ) : (
            <>
              {filteredItems.groups.length > 0 && (
                <div className="py-2">
                  <p className="px-5 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Channels</p>
              {filteredItems.groups.map(g => (
                <div
                  key={g.id}
                  onClick={() => setActiveChat({ id: g.id, name: g.name, isGroup: true })}
                  className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${activeChat?.id === g.id ? "bg-indigo-500/10 border-r-2 border-indigo-500" : "hover:bg-[#0a0a0a]"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate">{g.name}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{g.members.length} Members</p>
                  </div>
                  {unreadCounts[g.id] > 0 && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-600/40">
                      {unreadCounts[g.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="py-2 border-t border-[#111]">
            <p className="px-5 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Direct Messages</p>
            {filteredItems.members.map(m => (
              <div
                key={m.id}
                onClick={() => setActiveChat({ id: m.id, name: m.name, isGroup: false, avatar: m.avatar })}
                className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${activeChat?.id === m.id ? "bg-indigo-500/10 border-r-2 border-indigo-500" : "hover:bg-[#0a0a0a]"}`}
              >
                <div className="relative">
                  {m.avatar ? (
                    <img src={getUrl(m.avatar)} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-[#222]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[10px] text-gray-400 font-bold">
                      {initials(m.name)}
                    </div>
                  )}
                  {m.is_online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#050505] rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-200 truncate">{m.name}</p>
                  <p className="text-[10px] text-gray-600 truncate">{m.teams?.[0] || "Team Member"}</p>
                </div>
                {unreadCounts[m.id] > 0 && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-600/40">
                    {unreadCounts[m.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col bg-[#0b141a] min-w-0 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#202c33]/50 flex items-center justify-between bg-[#111b21]">
              <div 
                className={`flex items-center gap-3 ${activeChat.isGroup ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                onClick={() => {
                  if (activeChat.isGroup) setShowGroupSettings(true);
                }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveChat(null); }} 
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                {activeChat.avatar ? (
                  <img src={getUrl(activeChat.avatar)} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                    {activeChat.isGroup ? <Users size={20} /> : <User size={20} />}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{activeChat.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {activeChat.isGroup ? "Group Channel" : (members.find(m => m.id === activeChat.id)?.is_online ? "Active Now" : "Offline")}
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 no-scrollbar relative">
              {loadingMessages ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 bg-[#020202]">
                   <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading Messages...</p>
                 </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <MessageSquareIcon />
                  <p className="text-xs font-bold mt-2 uppercase tracking-widest">Start a conversation</p>
                </div>
              ) : 
                messages.map((msg, idx) => {
                const isMe = msg.sender_id === user?.id;
                const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                const isHovered = hoveredMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group relative ${isMe ? "flex-row-reverse" : ""}`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* Avatar */}
                    {!isMe && (
                      <div className="relative shrink-0 mt-auto mb-1">
                        {msg.sender_avatar ? (
                          <img src={getUrl(msg.sender_avatar)} className="w-8 h-8 rounded-full object-cover border border-[#202c33]" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center text-[10px] text-gray-400 font-bold border border-[#202c33]">
                            {initials(msg.sender_name)}
                          </div>
                        )}
                        {(msg.attachments?.some(url => url.match(/\.(webm|mp3|wav|ogg)$/i) || url.startsWith("data:audio"))) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0b141a] rounded-full flex items-center justify-center border border-[#202c33]">
                            <Mic size={10} className="text-[#53bdeb]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble + Hover Actions */}
                    <div className={`flex items-center gap-2 max-w-[75%] ${!isMe ? "flex-row-reverse" : ""}`}>
                      {/* Hover action bar — always left of bubble */}
                      <div className={`flex items-center gap-1 transition-all duration-150 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"} bg-[#111] border border-[#222] rounded-xl px-1 py-1 shadow-xl shrink-0`}>
                        <button
                          onClick={() => { setReplyToMsg(msg); textareaRef.current?.focus(); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                        <button
                          onClick={() => setForwardMsg(msg)}
                          className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Forward"
                        >
                          <Forward size={14} />
                        </button>
                      </div>

                      <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                        {showAvatar && !isMe && (
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 px-1">
                            {msg.sender_name}
                          </span>
                        )}

                        {/* Reply Quote */}
                        {msg.reply_to && (
                          <div className={`mb-1 px-3 py-2 rounded-xl border-l-2 border-indigo-500 bg-indigo-500/5 max-w-full ${isMe ? "text-right border-l-0 border-r-2" : ""}`}>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{msg.reply_to.sender_name}</p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{msg.reply_to.content}</p>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div className={`relative px-3 py-2 rounded-2xl text-sm w-fit max-w-full ${isMe ? "bg-[#005c4b] text-white rounded-tr-none shadow-sm" : "bg-[#202c33] text-gray-100 rounded-tl-none shadow-sm"}`}>
                          {/* Forwarded label */}
                          {msg.is_forwarded && (
                            <div className="flex items-center gap-1 mb-1 opacity-60">
                              <Forward size={11} />
                              <span className="text-[10px] font-semibold italic">Forwarded</span>
                            </div>
                          )}
                          
                          <div className={`relative flex flex-col ${msg.attachments?.some(url => url.match(/\.(webm|mp3|wav|ogg)$/i) || url.startsWith("data:audio")) ? "" : "pb-1"}`}>
                            {msg.content?.trim() && (
                              <div className="inline-block break-all pr-4 min-w-[60px] whitespace-pre-wrap leading-relaxed pb-1 relative">
                                {msg.content}
                                <span className="inline-block w-12" /> {/* Layout spacer for timestamp */}
                              </div>
                            )}
                            
                            {msg.attachments?.map((url, i) => (
                              <div key={i} className="mt-1">
                                {(url.match(/\.(webm|mp3|wav|ogg)$/i) || url.startsWith("data:audio")) ? (
                                  <ERPVoicePlayer src={getUrl(url)} isMe={isMe} />
                                ) : (
                                  <img src={getUrl(url)} className="max-w-full rounded-lg border border-white/5" alt="Attachment" />
                                )}
                              </div>
                            ))}

                            {/* Time + Ticks (Bottom Right) */}
                            <div className="absolute -bottom-1 -right-0.5 flex items-center gap-1 opacity-70 select-none pr-1 pb-1">
                              <span className="text-[9px] font-medium whitespace-nowrap">{format(new Date(msg.created_at), 'HH:mm')}</span>
                              {isMe && !msg.is_group && (
                                <div className="flex items-center">
                                  {msg.status === "sent" && <Check size={11} className="text-gray-300" />}
                                  {msg.status === "delivered" && <CheckCheck size={11} className="text-gray-300" />}
                                  {msg.status === "seen" && <CheckCheck size={12} className="text-[#53bdeb] drop-shadow-[0_0_1px_rgba(83,189,235,0.4)]" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sender Avatar (Right side) */}
                      {isMe && (
                        <div className="relative shrink-0 mt-auto mb-1 ml-2">
                          {user?.avatar ? (
                            <img src={getUrl(user.avatar)} className="w-8 h-8 rounded-full object-cover border border-[#005c4b]" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#005c4b] flex items-center justify-center text-[10px] text-white/50 font-bold border border-[#005c4b]">
                              {initials(user?.name || "Me")}
                            </div>
                          )}
                          {(msg.attachments?.some(url => url.match(/\.(webm|mp3|wav|ogg)$/i) || url.startsWith("data:audio"))) && (
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#0b141a] rounded-full flex items-center justify-center border border-[#202c33]">
                              <Mic size={10} className="text-[#53bdeb]" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-2 bg-[#111b21] border-t border-white/5">
              {/* Reply Preview */}
              {replyToMsg && (
                <div className="flex items-center gap-3 mb-2 px-4 py-2 bg-[#202c33] border-l-4 border-[#00a884] rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#00a884] uppercase">Replying to {replyToMsg.sender_name}</p>
                    <p className="text-xs text-gray-400 truncate">{replyToMsg.content}</p>
                  </div>
                  <button onClick={() => setReplyToMsg(null)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 transition-all"
              >
                {/* Input Pill */}
                <div className="flex-1 relative flex items-end gap-2 bg-[#202c33] rounded-full p-1 shadow-none border-none ring-0">
                  <div className="flex items-center h-9 px-1 gap-0.5">
                    {/* Emoji Picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(p => !p)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Emoji"
                      >
                        <Smile size={24} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-14 left-0 z-50 bg-[#233138] border border-[#3b4a54] rounded-2xl p-3 shadow-2xl w-72 animate-in slide-in-from-bottom-2">
                          <div className="grid grid-cols-10 gap-1">
                            {EMOJI_LIST.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => insertEmoji(emoji)}
                                className="text-xl p-1 hover:bg-white/10 rounded-lg transition-colors leading-none"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Attachment (Pin) */}
                    <label className="p-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
                      <Paperclip size={22} className="rotate-[225deg]" />
                      <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>

                  <div className="flex-1 bg-transparent min-h-[44px] flex items-center">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message"
                      className="w-full bg-transparent border-none py-3 px-1 text-[16px] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 resize-none custom-scrollbar max-h-32 leading-tight ring-0 outline-none"
                    />
                  </div>

                  <div className="flex items-center h-10 px-1 pr-3">
                    <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Camera size={24} />
                    </button>
                  </div>

                  {/* Recording Overlay */}
                  {isRecording && (
                    <div className="absolute inset-0 bg-[#202c33] z-20 rounded-full flex items-center justify-between px-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-[#f15c6d] rounded-full animate-pulse shadow-[0_0_10px_rgba(241,92,109,0.5)]" />
                        <span className="text-white font-mono text-base font-bold">{formatTime(recordingTime)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Recording...</span>
                      </div>
                      <div 
                        className="flex items-center gap-1 transition-all duration-75"
                        style={{ 
                          transform: `translateX(${dragXOffset}px)`,
                          opacity: Math.max(0, 1 - Math.abs(dragXOffset) / 100)
                        }}
                      >
                        <span className="text-xs text-gray-500 px-2 pointer-events-none">Slide to cancel</span>
                        <Trash2 size={18} className="text-gray-600 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center z-30">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Sending...</span>
                    </div>
                  )}
                </div>

                {/* Circular Action Button */}
                <div className="mb-0.5">
                  {!inputText.trim() && !uploading ? (
                    <button
                      type="button"
                      onPointerDown={e => { e.preventDefault(); startRecording(e); }}
                      onPointerUp={e => { 
                        e.preventDefault(); 
                        try { (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId); } catch (err) {}
                        stopRecording(); 
                      }}
                      onPointerMove={handlePointerMove}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-500/20" : "bg-[#00a884] text-white hover:bg-[#008f72] shadow-md"}`}
                      title="Voice Message"
                    >
                      {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !uploading) || submitting}
                      className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white hover:bg-[#008f72] shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting || uploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={22} className="translate-x-0.5" />
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mb-4 rotate-12">
              <MessageSquareIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-300">Welcome to Chat</h2>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-2">Select a member or channel to start chatting</p>
          </div>
        )}
      </div>

      {/* Group Create Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowGroupModal(false)}>
          <div className="bg-[#0c0c0c] border border-[#222] rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Create Group</h2>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Group Name</label>
                <input
                  className="bg-[#111] border border-[#222] text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500/50 focus:outline-none"
                  placeholder="e.g. Project Alpha Team"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Add Members</label>
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {members.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMembers(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${selectedMembers.includes(m.id) ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-[#111] border border-transparent"}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {initials(m.name)}
                      </div>
                      <span className="text-sm font-semibold flex-1">{m.name}</span>
                      {selectedMembers.includes(m.id) && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={createGroup}
                disabled={!newGroupName.trim() || selectedMembers.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {forwardMsg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setForwardMsg(null)}>
          <div className="bg-[#0c0c0c] border border-[#222] rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-white">Forward Message</h2>
              <button onClick={() => setForwardMsg(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            {/* Preview */}
            <div className="mb-6 px-4 py-3 bg-[#111] border border-[#222] rounded-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Message Preview</p>
              <p className="text-sm text-gray-300 line-clamp-3">{forwardMsg?.content}</p>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Forward To</p>
            <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {groups.length > 0 && (
                <>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2 mb-1">Channels</p>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleForwardSend(g.id, true)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-indigo-500/10 rounded-xl transition-colors text-left border border-transparent hover:border-indigo-500/20"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400"><Users size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-white">{g.name}</p>
                        <p className="text-[10px] text-gray-600">{g.members.length} members</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2 mt-3 mb-1">People</p>
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleForwardSend(m.id, false)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-indigo-500/10 rounded-xl transition-colors text-left border border-transparent hover:border-indigo-500/20"
                >
                  <div className="relative">
                    {m.avatar ? (
                      <img src={getUrl(m.avatar)} className="w-9 h-9 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center text-[10px] font-bold text-gray-500">{initials(m.name)}</div>
                    )}
                    {m.is_online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-[#0c0c0c] rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-gray-600">{m.teams?.[0] || "Team Member"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showGroupSettings && activeChat?.isGroup && (
        <GroupSettingsSidebar 
           activeChat={activeChat}
           groups={groups}
           members={members}
           onClose={() => setShowGroupSettings(false)}
           currentUser={user}
           onTransferAdmin={handleTransferAdmin}
           onLeaveGroup={handleLeaveGroup}
           onUpdateGroup={handleUpdateGroup}
           onAddMembers={handleAddMembers}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        textarea {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }

        textarea:focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          --tw-ring-color: transparent !important;
        }
      `}</style>
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function GroupSettingsSidebar({ activeChat, groups, members, onClose, currentUser, onTransferAdmin, onLeaveGroup, onUpdateGroup, onAddMembers }: any) {
  const group = groups.find((g: any) => g.id === activeChat.id);
  if (!group) return null;

  const isAdmin = group.admin_id === currentUser?.id;
  const groupMembers = group.members.map((mid: string) => members.find((m: any) => m.id === mid) || { id: mid, name: "Unknown User", is_online: false }).filter((m: any) => m.id !== currentUser?.id);
  
  const fullMembers = [{ id: currentUser?.id, name: currentUser?.name + " (You)", is_online: true }, ...groupMembers];
  const availableToAdd = members.filter((m: any) => !group.members.includes(m.id));

  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(group.name);

  const [editingDesc, setEditingDesc] = useState(false);
  const [editDescValue, setEditDescValue] = useState(group.description || "");

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

  return (
    <div className="fixed inset-0 md:static md:w-[320px] bg-[#111b21] md:border-l border-[#202c33]/50 flex flex-col h-full overflow-y-auto no-scrollbar shadow-2xl z-50 shrink-0">
      <div className="p-5 border-b border-[#202c33]/50 flex items-center justify-between sticky top-0 bg-[#111b21]/90 backdrop-blur-md z-10">
        <h2 className="text-sm font-bold text-white">Group Info</h2>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-[#111] rounded-lg">
          <X size={16} />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-[#1a1a1a]">
        <div className="w-24 h-24 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
          <Users size={40} />
        </div>
        
        {editingName ? (
           <div className="flex items-center gap-2 w-full mt-1">
             <input autoFocus value={editNameValue} onChange={e=>setEditNameValue(e.target.value)} className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500" />
             <button onClick={()=>{onUpdateGroup(editNameValue, undefined); setEditingName(false)}} className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors text-indigo-400 rounded-lg"><Check size={14}/></button>
           </div>
        ) : (
           <div className="flex items-center gap-2 mt-1">
             <h3 className="text-xl font-black text-white text-center break-words max-w-full">{group.name}</h3>
             <button onClick={()=>{setEditNameValue(group.name); setEditingName(true)}} className="text-gray-500 hover:text-white transition-colors"><Pencil size={12}/></button>
           </div>
        )}

        {editingDesc ? (
           <div className="flex items-center gap-2 w-full mt-3">
             <textarea autoFocus value={editDescValue} onChange={e=>setEditDescValue(e.target.value)} className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 min-h-[60px] custom-scrollbar" placeholder="Add a description" />
             <button onClick={()=>{onUpdateGroup(undefined, editDescValue); setEditingDesc(false)}} className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors text-indigo-400 rounded-lg self-end"><Check size={14}/></button>
           </div>
        ) : (
           <div className="flex items-start gap-2 mt-2 w-full group/desc justify-center">
             <p className="text-xs text-gray-500 text-center break-words max-w-full">
               {group.description || "No description provided."}
             </p>
             <button onClick={()=>{setEditDescValue(group.description||""); setEditingDesc(true)}} className="text-gray-500 hover:text-white opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5"><Pencil size={12}/></button>
           </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-6 min-h-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Members ({fullMembers.length})
          </p>
          {isAdmin && (
            <button onClick={() => setShowAddMembers(!showAddMembers)} className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
               <Plus size={12} /> Add
            </button>
          )}
        </div>

        {showAddMembers && (
          <div className="mb-4 bg-[#111] border border-[#222] rounded-xl p-3 flex flex-col gap-2 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Members</p>
            <div className="overflow-y-auto max-h-32 flex flex-col gap-1 custom-scrollbar">
               {availableToAdd.map((m: any) => (
                 <label key={m.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:bg-[#1a1a1a] p-1.5 rounded-lg transition-colors">
                    <input type="checkbox" checked={selectedNewMembers.includes(m.id)} onChange={e => setSelectedNewMembers(prev => e.target.checked ? [...prev, m.id] : prev.filter(id => id !== m.id))} className="accent-indigo-500 w-3 h-3" />
                    {m.name}
                 </label>
               ))}
               {availableToAdd.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Everyone is already in this group.</p>}
            </div>
            {selectedNewMembers.length > 0 && (
               <button onClick={() => { onAddMembers(selectedNewMembers); setSelectedNewMembers([]); setShowAddMembers(false); }} className="w-full py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold mt-1 transition-colors">Add Selected</button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {fullMembers.map((m: any) => {
            const isMemberAdmin = m.id === group.admin_id;
            return (
              <div key={m.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {m.avatar ? (
                      <img src={m.avatar.startsWith("http") ? m.avatar : `${API}${m.avatar}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {m.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    {m.is_online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-[#0c0c0c] rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{m.name}</p>
                    {isMemberAdmin && <p className="text-[10px] text-indigo-400 font-bold">Admin</p>}
                  </div>
                </div>
                {isAdmin && !isMemberAdmin && (
                  <button 
                    onClick={() => {
                       if (confirm(`Make ${m.name} the new admin?`)) onTransferAdmin(m.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-[#111] hover:bg-indigo-500/20 hover:text-indigo-400 text-[10px] font-bold rounded-md transition-all text-gray-400 border border-[#222]"
                  >
                    Make Admin
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-[#1a1a1a] mt-auto">
        <button 
          onClick={() => {
             if (confirm("Are you sure you want to leave this group?")) onLeaveGroup();
          }}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20 text-sm cursor-pointer"
        >
          Exit Group
        </button>
      </div>
    </div>
  );
}
