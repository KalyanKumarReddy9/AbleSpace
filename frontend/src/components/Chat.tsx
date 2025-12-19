import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';

interface Message {
  _id?: string;
  taskId: string;
  senderId: string | { _id: string; name: string; email: string };
  content: string;
  timestamp: string;
  senderName?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ChatProps {
  taskId: string;
  currentUser: User;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ taskId, currentUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get sender ID from message
  const getSenderId = (msg: Message): string => {
    if (typeof msg.senderId === 'object' && msg.senderId !== null) {
      return msg.senderId._id;
    }
    return msg.senderId as string;
  };

  // Helper to get sender name from message
  const getSenderName = (msg: Message): string => {
    if (msg.senderName) return msg.senderName;
    if (typeof msg.senderId === 'object' && msg.senderId !== null) {
      return msg.senderId.name;
    }
    if (getSenderId(msg) === currentUser._id) {
      return currentUser.name;
    }
    return 'Unknown';
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/academic/tasks/${taskId}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [taskId]);

  // Join task room and set up socket listeners
  useEffect(() => {
    // Join the task room
    socketService.joinTaskRoom(taskId);

    // Listen for new messages
    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessageSent = (message: Message) => {
      // We already have this message from the send action
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSent(handleMessageSent);

    // Scroll to bottom when messages change
    scrollToBottom();

    // Clean up
    return () => {
      socketService.offReceiveMessage(handleReceiveMessage);
      socketService.offMessageSent(handleMessageSent);
      socketService.leaveTaskRoom(taskId);
    };
  }, [taskId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        taskId,
        content: newMessage.trim()
      };

      // Send message through socket
      socketService.sendMessage(messageData);

      // Add to local state immediately for better UX
      const tempMessage: Message = {
        taskId,
        senderId: currentUser._id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        senderName: currentUser.name
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Save message to database
      const response = await fetch('/api/academic/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to save message');
      }

      const savedMessage = await response.json();
      
      // Replace temp message with saved message
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0) {
          newMessages[lastIndex] = savedMessage;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message if save failed
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h3 className="text-lg font-medium text-gray-900">Task Chat</h3>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = getSenderId(message) === currentUser._id;
              const senderName = getSenderName(message);
              
              return (
                <div 
                  key={message._id || `${getSenderId(message)}-${message.timestamp}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {senderName} {isOwnMessage ? '(You)' : ''}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div 
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded-r-lg font-medium ${
              newMessage.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;