import React, { useState, useEffect } from 'react';

const MessageDisplay = ({
  currentChat,
  chatType,
  messages,
  currentUser,
  arrayBufferToBase64,
  messagesEndRef,
  onReply,
  onDelete,
  onEdit,
  socket,              // Add socket prop
  onMarkAsRead,        // Add callback to update parent state
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');


  // Mark messages as read when chat is opened
  useEffect(() => {
    if (socket && currentChat && chatType && messages.length > 0) {
      const hasUnreadMessages = messages.some(msg => !msg.isRead && msg.sender?._id !== currentUser?._id);
      if (hasUnreadMessages) {
        socket.emit('markMessagesAsRead', {
          conversationId: currentChat.id,
          type: chatType,
        });
        console.log(`Emitted markMessagesAsRead for ${chatType} chat ${currentChat.id}`);

        // Optionally update parent state immediately
        if (chatType === 'private' && onMarkAsRead) {
          onMarkAsRead(currentChat.id);
        }
      }
    }
  }, [socket, currentChat, chatType, messages, currentUser, onMarkAsRead]);

  const openModal = (photoBase64, contentType) => {
    setSelectedImage({ base64: photoBase64, contentType });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditStart = (messageId, content, isSender) => {
    if (!isSender) return;
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleEditSubmit = (messageId) => {
    if (editContent.trim()) {
      onEdit(messageId, editContent);
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleKeyDown = (e, messageId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit(messageId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  let lastMessageDate = '';

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-100 to-white p-4 rounded-lg shadow-lg overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {currentChat ? (
        messages.length === 0 ? (
          <p className="text-center text-gray-500 italic text-lg">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const photoBase64 = msg.photo?.data?.data ? arrayBufferToBase64(msg.photo.data.data) : msg.photo?.data;
              const fileBase64 = msg.file?.data?.data ? arrayBufferToBase64(msg.file.data.data) : msg.file?.data;
              const isSender = msg.sender?._id === currentUser?._id;
              const messageDate = msg.timestamp ? formatTimestamp(msg.timestamp) : 'N/A';
              const showDate = messageDate !== lastMessageDate;
              lastMessageDate = messageDate;
              const isReply = !!msg.parentMessageId;
              const parentMessage = isReply ? messages.find(m => m._id.toString() === msg.parentMessageId.toString()) : null;
              const parentContent = parentMessage ? (
                parentMessage.content ||
                (parentMessage.photo?.data && 'Photo') ||
                (parentMessage.file?.data && parentMessage.file.fileName) ||
                'Attachment'
              ) : null;
              const canEditOrDelete = isSender && !msg.deletedAt;

              return (
                <div key={msg._id || index}>
                  {showDate && (
                    <div className="text-center text-gray-400 text-sm my-6">
                      <span className="px-3 py-1 bg-white/50 rounded-full shadow-sm">{messageDate}</span>
                    </div>
                  )}
                  <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`group flex items-start ${isSender ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-2'}`}>
                      {!isSender && (
                        <img
                          src={chatType === 'private' ? currentChat.avatar : msg.sender?.avatar || 'https://via.placeholder.com/32'}
                          alt={chatType === 'private' ? currentChat.username : msg.sender?.username}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-md"
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        {/* Options Container - Visible on Hover */}
                        {!msg.deletedAt && (
                          <div className={`flex items-center bg-gray-100 rounded-full px-2 py-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSender ? 'order-0' : 'order-1'}`}>
                            <button
                              onClick={() => onReply(msg._id)}
                              className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                              title="Reply"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                            {canEditOrDelete && msg.type === 'text' && (
                              <button
                                onClick={() => handleEditStart(msg._id, msg.content, isSender)}
                                className="p-1 text-green-500 hover:text-green-700 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {canEditOrDelete && (
                              <button
                                onClick={() => onDelete(msg._id)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2h8a2 2 0 00-2-2m-4 0V3m-3 4h10" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col ${isSender ? 'order-1' : 'order-0'}`}>
                          {!isSender && (
                            <p className="text-xs font-semibold text-gray-700 ml-1">{msg.sender?.username}</p>
                          )}
                          <div className={`max-w-md p-3 rounded-2xl shadow-md transition-all duration-200 ${
                            isSender 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}>
                            {msg.deletedAt ? (
                              <p className={`text-sm italic ${isSender ? 'text-gray-200' : 'text-gray-500'}`}>
                                [Message deleted]
                              </p>
                            ) : editingMessageId === msg._id ? (
                              <div className="flex flex-col space-y-2">
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, msg._id)}
                                  className="p-2 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditSubmit(msg._id)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {isReply && parentMessage ? (
                                  <div className="break-words">
                                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-2 rounded-lg mb-3 border-l-4 border-blue-500">
                                      <p className="font-semibold text-sm mb-1 text-blue-700">{parentMessage.sender?.username}</p>
                                      <p className="text-sm">{parentContent}</p>
                                      {parentMessage.photo?.data && (
                                        <img
                                          src={`data:${parentMessage.photo.contentType};base64,${arrayBufferToBase64(parentMessage.photo.data.data)}`}
                                          alt="Parent photo"
                                          className="max-w-[120px] mt-2 rounded-lg shadow-sm"
                                        />
                                      )}
                                      {parentMessage.file?.data && (
                                        <a
                                          href={`data:${parentMessage.file.contentType};base64,${arrayBufferToBase64(parentMessage.file.data.data)}`}
                                          download={parentMessage.file.fileName}
                                          className="text-blue-600 mt-2 inline-block text-sm underline hover:text-blue-800"
                                        >
                                          {parentMessage.file.fileName}
                                        </a>
                                      )}
                                    </div>
                                    <p className={`text-sm mt-1 ${isSender ? 'text-white' : 'text-gray-800'}`}>{msg.content}</p>
                                    {msg.photo?.data && (
                                      <div className="mt-2">
                                        <img
                                          src={`data:${msg.photo.contentType};base64,${photoBase64}`}
                                          alt="Attached photo"
                                          className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
                                          onClick={() => openModal(photoBase64, msg.photo.contentType)}
                                        />
                                      </div>
                                    )}
                                    {msg.file?.data && (
                                      <div className="mt-2">
                                        <a
                                          href={`data:${msg.file.contentType};base64,${fileBase64}`}
                                          download={msg.file.fileName}
                                          className="inline-flex items-center bg-gray-100 p-2 rounded-lg shadow-sm text-blue-600 hover:bg-gray-200 transition text-sm"
                                        >
                                          <span className="mr-2">📎</span> {msg.file.fileName}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                                    {msg.photo?.data && (
                                      <div className="mt-2">
                                        <img
                                          src={`data:${msg.photo.contentType};base64,${photoBase64}`}
                                          alt="Attached photo"
                                          className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
                                          onClick={() => openModal(photoBase64, msg.photo.contentType)}
                                        />
                                        {!isSender && (
                                          <p className="text-xs mt-1 text-gray-500">
                                            Sent by {msg.sender?.username}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    {msg.file?.data && (
                                      <div className="mt-2">
                                        <a
                                          href={`data:${msg.file.contentType};base64,${fileBase64}`}
                                          download={msg.file.fileName}
                                          className="inline-flex items-center bg-gray-100 p-2 rounded-lg shadow-sm text-blue-600 hover:bg-gray-200 transition text-sm"
                                        >
                                          <span className="mr-2">📎</span> {msg.file.fileName}
                                        </a>
                                        {!isSender && (
                                          <p className="text-xs mt-1 text-gray-500">
                                            Sent by {msg.sender?.username}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${isSender ? 'text-gray-500 text-right' : 'text-gray-500'}`}>
                            {msg.timestamp ? formatTime(msg.timestamp) : 'N/A'}
                            {msg.isEdited && ' (Edited)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <p className="text-center text-gray-500 italic text-lg">Select a chat to start messaging.</p>
      )}
      <div ref={messagesEndRef} />
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative">
            <img
              src={`data:${selectedImage.contentType};base64,${selectedImage.base64}`}
              alt="Full-size preview"
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDisplay;