import React, { useState } from 'react';

const MessageInput = ({
  messageInput,
  setMessageInput,
  photo,
  setPhoto,
  file,
  setFile,
  handleSendMessage,
  photoPreviewUrl,
  setPhotoPreviewUrl,
  replyToMessageId,
  setReplyToMessageId,
  messages,
}) => {
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const removeAttachment = (type) => {
    if (type === 'photo') {
      setPhoto(null);
      setPhotoPreviewUrl(null);
    }
    if (type === 'file') setFile(null);
  };

  const handlePhotoChange = (e) => {
    const selectedPhoto = e?.target?.files?.[0];
    if (selectedPhoto) {
      setPhoto(selectedPhoto);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedPhoto);
      setShowAttachmentOptions(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Reply Context UI */}
      {replyToMessageId && (
        <div className="bg-gray-100 p-2 rounded-lg mb-2 flex justify-between items-center border-l-4 border-blue-500">
          <span className="text-sm text-gray-700 truncate max-w-[80%]">
            Replying to: {messages?.find(m => m._id === replyToMessageId)?.content || 'Message'}
          </span>
          <button
            onClick={() => setReplyToMessageId(null)}
            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
            aria-label="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attachment Preview */}
      {(photo || file) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {photo && photoPreviewUrl && (
            <div className="relative inline-block">
              <img
                src={photoPreviewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                onClick={() => removeAttachment('photo')}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                aria-label="Remove photo"
              >
                ✕
              </button>
            </div>
          )}
          {file && (
            <div className="flex items-center bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => removeAttachment('file')}
                className="ml-2 text-red-500 hover:text-red-700 transition"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="relative flex items-center space-x-3">
        <button
          onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle attachment options"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 p-3 rounded-lg border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={replyToMessageId ? "Type your reply..." : "Type a message..."}
          aria-label="Message input"
        />
        <button
          onClick={handleSendMessage}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !messageInput.trim() && !photo && !file
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={!messageInput.trim() && !photo && !file}
          aria-label="Send message"
        >
          Send
        </button>
        {showAttachmentOptions && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-48 z-10">
            <label className="block cursor-pointer p-2 hover:bg-gray-100 rounded transition">
              <span className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Upload Photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                aria-label="Upload photo"
              />
            </label>
            <label className="block cursor-pointer p-2 hover:bg-gray-100 rounded transition">
              <span className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Upload File
              </span>
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setShowAttachmentOptions(false);
                }}
                className="hidden"
                aria-label="Upload file"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;