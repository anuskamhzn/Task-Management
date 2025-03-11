import React, { useState } from 'react';

const MessageDisplay = ({
  currentChat,
  chatType,
  messages,
  currentUser,
  arrayBufferToBase64,
  messagesEndRef,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (photoBase64, contentType) => {
    setSelectedImage({ base64: photoBase64, contentType });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      weekday: 'short', // e.g., Mon, Tue
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Track the last displayed date to group messages by date
  let lastMessageDate = '';

  return (
    <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {currentChat ? (
        messages.length === 0 ? (
          <p className="text-center text-gray-500 italic">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const photoBase64 = msg.photo?.data?.data ? arrayBufferToBase64(msg.photo.data.data) : msg.photo?.data;
              const fileBase64 = msg.file?.data?.data ? arrayBufferToBase64(msg.file.data.data) : msg.file?.data;
              const isSender = msg.sender?._id === currentUser?._id;

              // Format the date and check if it has changed from the previous message
              const messageDate = msg.timestamp ? formatTimestamp(msg.timestamp) : 'N/A';
              const showDate = messageDate !== lastMessageDate;
              lastMessageDate = messageDate;

              return (
                <div key={msg._id || index}>
                  {showDate && (
                    <div className="text-center text-gray-500 text-sm my-4">
                      {messageDate}
                    </div>
                  )}

                  <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isSender && (
                        <img
                          src={chatType === 'private' ? currentChat.avatar : msg.sender?.avatar}
                          alt={chatType === 'private' ? currentChat.username : msg.sender?.username}
                          className="w-8 h-8 rounded-full border border-gray-200"
                        />
                      )}
                      <div className="flex flex-col">
                        {!isSender && (
                          <p className="text-xs mt-1 font-semibold">{msg.sender?.username}</p>
                        )}
                        <div className={`max-w-xs p-3 rounded-lg shadow-sm ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          {msg.content && <p className="break-words text-sm">{msg.content}</p>}
                          {msg.photo?.data && (
                            <div className="mt-2">
                              <img
                                src={`data:${msg.photo.contentType};base64,${photoBase64}`}
                                alt="Attached photo"
                                className="max-w-full rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition"
                                onClick={() => openModal(photoBase64, msg.photo.contentType)}
                              />
                              {!isSender && (
                                <p className="text-xs mt-1 opacity-75">
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
                                className="inline-flex items-center bg-gray-200 p-2 rounded-lg shadow-sm text-blue-600 hover:bg-gray-300 transition text-sm"
                              >
                                <span className="mr-2">📎</span> {msg.file.fileName}
                              </a>
                              {!isSender && (
                                <p className="text-xs mt-1 opacity-75">
                                  Sent by {msg.sender?.username}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {msg.timestamp ? formatTime(msg.timestamp) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <p className="text-center text-gray-500 italic">Select a chat to start messaging.</p>
      )}
      <div ref={messagesEndRef} />

      {/* Image Preview Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative">
            <img
              src={`data:${selectedImage.contentType};base64,${selectedImage.base64}`}
              alt="Full-size preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
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
