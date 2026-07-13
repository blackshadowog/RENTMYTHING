import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ArrowLeft, RefreshCw, Smartphone, User, Star } from 'lucide-react';
import { api } from '../lib/api';
import { Message, User as UserType } from '../types';

interface ChatMessengerProps {
  user: UserType;
  productIdDefault?: string;
  receiverIdDefault?: string;
  onClose?: () => void;
}

export const ChatMessenger: React.FC<ChatMessengerProps> = ({
  user,
  productIdDefault,
  receiverIdDefault,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [activeChatKey, setActiveChatKey] = useState<string | null>(null); // formatted: productId_partnerId
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data);
      
      // Auto-set default active chat if provided
      if (productIdDefault && receiverIdDefault && !activeChatKey) {
        setActiveChatKey(`${productIdDefault}_${receiverIdDefault}`);
      } else if (data.length > 0 && !activeChatKey) {
        // Group and set first available
        const groups = getChatGroups(data);
        const keys = Object.keys(groups);
        if (keys.length > 0) {
          setActiveChatKey(keys[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll messages every 6 seconds for simple real-time updates
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [productIdDefault, receiverIdDefault]);

  useEffect(() => {
    // Scroll to bottom when messages load
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatKey]);

  // Helper to group messages by product + partner student
  const getChatGroups = (allMsgs: Message[]) => {
    const groups: Record<string, {
      productTitle: string;
      productId: string;
      partnerId: string;
      partnerName: string;
      lastMsg: string;
      time: string;
      list: Message[];
    }> = {};

    allMsgs.forEach(m => {
      const isSender = m.senderId === user.id;
      const partnerId = isSender ? m.receiverId : m.senderId;
      const partnerName = isSender ? (m.receiverName || 'Unknown Partner') : (m.senderName || 'Unknown Partner');
      const key = `${m.productId}_${partnerId}`;

      if (!groups[key]) {
        groups[key] = {
          productTitle: m.productTitle || 'Shared Product',
          productId: m.productId,
          partnerId,
          partnerName,
          lastMsg: m.text,
          time: m.createdAt,
          list: []
        };
      }

      groups[key].list.push(m);
      // Keep last message up-to-date
      if (new Date(m.createdAt) > new Date(groups[key].time)) {
        groups[key].lastMsg = m.text;
        groups[key].time = m.createdAt;
      }
    });

    // If default is provided but has no history, seed an empty conversation
    if (productIdDefault && receiverIdDefault) {
      const defaultKey = `${productIdDefault}_${receiverIdDefault}`;
      if (!groups[defaultKey]) {
        groups[defaultKey] = {
          productTitle: 'Inquiring Item',
          productId: productIdDefault,
          partnerId: receiverIdDefault,
          partnerName: 'Owner Student',
          lastMsg: 'Start a conversation...',
          time: new Date().toISOString(),
          list: []
        };
      }
    }

    return groups;
  };

  const groups = getChatGroups(messages);
  const activeChat = activeChatKey ? groups[activeChatKey] : null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    try {
      const newMsg = await api.sendMessage(
        activeChat.productId,
        activeChat.partnerId,
        inputText.trim()
      );
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex h-[550px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
      
      {/* Sidebar List (Left Panel) */}
      <div className={`w-full flex-col md:flex md:w-80 border-r border-gray-100 ${activeChatKey && 'hidden md:flex'}`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50">
          <span className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
            <MessageSquare className="h-4 w-4 text-rose-500" />
            <span>Student Chats</span>
          </span>
          <button 
            onClick={fetchMessages}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <p className="p-4 text-center text-xs text-gray-400">Loading inbox...</p>
          ) : Object.keys(groups).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-500">No chats yet</p>
              <p className="text-[10px] text-gray-400 mt-1">Open a product and click "Chat with Owner" to start a conversation!</p>
            </div>
          ) : (
            Object.keys(groups).map(key => {
              const g = groups[key];
              const isActive = activeChatKey === key;
              return (
                <div
                  key={key}
                  onClick={() => setActiveChatKey(key)}
                  className={`flex cursor-pointer flex-col p-4 text-left transition hover:bg-gray-50 ${isActive ? 'bg-rose-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-900 truncate max-w-[140px]">
                      {g.partnerName}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {new Date(g.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 mt-0.5 truncate">{g.productTitle}</span>
                  <p className="text-[11px] text-gray-500 truncate mt-1.5">{g.lastMsg}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Stage (Right Panel) */}
      <div className={`flex flex-1 flex-col ${!activeChatKey && 'hidden md:flex bg-gray-50'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center border-b border-gray-100 px-4 py-3 bg-white">
              <button
                onClick={() => setActiveChatKey(null)}
                className="mr-2 rounded-full p-1 text-gray-500 hover:bg-gray-100 md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-gray-900 truncate">{activeChat.partnerName}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </div>
                <p className="truncate text-[10px] text-rose-500 font-semibold">{activeChat.productTitle}</p>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Minimize Chat
                </button>
              )}
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto bg-gray-50/60 p-4 space-y-3">
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-2.5 text-[10px] text-amber-800 text-center flex items-center justify-center space-x-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Keep communication here to stay covered by student agreement protection policies.</span>
              </div>

              {activeChat.list.map(m => {
                const isMyMessage = m.senderId === user.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isMyMessage ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'}`}>
                      {!isMyMessage && (
                        <p className="text-[9px] font-bold text-rose-500 mb-1">{m.senderName}</p>
                      )}
                      <p className="text-xs break-words leading-relaxed">{m.text}</p>
                      <span className={`block text-[8px] mt-1 text-right ${isMyMessage ? 'text-rose-200' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-100 bg-white p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500">Your Conversations</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">Select a chat from the left side, or visit a listing and click "Chat with Owner" to start a direct channel.</p>
          </div>
        )}
      </div>

    </div>
  );
};
