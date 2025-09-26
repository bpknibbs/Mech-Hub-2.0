import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  MicrophoneIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMessagingProps {
  className?: string;
}

export default function TeamMessaging({ className = '' }: TeamMessagingProps) {
  const { conversations, messages, sendMessage, markAsRead, loadConversation } = useMessaging();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : [];
  const selectedConv = conversations.find(c => c.id === selectedConversation);

  useEffect(() => {
    if (selectedConversation) {
      loadConversation(selectedConversation);
      markAsRead(selectedConversation);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, conversationMessages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    await sendMessage(selectedConversation, newMessage.trim());
    setNewMessage('');
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'asset':
        return '⚙️';
      case 'emergency':
        return '🚨';
      default:
        return '💬';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <PhotoIcon className="h-4 w-4 text-blue-600" />;
      case 'voice':
        return <MicrophoneIcon className="h-4 w-4 text-green-600" />;
      default:
        return <ChatBubbleLeftIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`h-96 border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Conversations</h3>
              <Button size="sm" onClick={() => setShowNewConversation(true)}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getConversationIcon(conversation.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conversation.title}</p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.description}
                    </p>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <ChatBubbleLeftIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getConversationIcon(selectedConv?.type || '')}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedConv?.title}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedConv?.participants.length} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedConv?.type === 'emergency' ? 'bg-red-100 text-red-800' :
                      selectedConv?.type === 'task' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedConv?.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map(message => (
                  <div key={message.id} className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {getMessageIcon(message.message_type)}
                        <span className={`text-xs font-medium ${
                          message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {message.sender_name}
                        </span>
                      </div>
                      
                      {message.message_type === 'photo' && message.file_url ? (
                        <div>
                          <img 
                            src={message.file_url} 
                            alt="Shared photo" 
                            className="rounded mb-2 max-w-full h-auto"
                          />
                          {message.message && (
                            <p className="text-sm">{message.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.message}</p>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}