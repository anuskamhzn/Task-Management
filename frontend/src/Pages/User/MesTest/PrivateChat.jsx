import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PrivateChat = ({
  users,
  currentChat,
  chatType,
  handleChatClick,
  setMessages,
  socket,
  token,
  currentUser,
  sendMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const initialLimit = 2; // Show 5 users initially

  // Fetch private messages
  useEffect(() => {
    if (currentChat && chatType === 'private') {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/message/private/${currentChat.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(response.data.messages || []);
        } catch (error) {
          console.error('Error fetching private messages:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [currentChat, chatType, token, setMessages]);

  // Determine the users to display based on the toggle state
  const displayedUsers = showAllUsers ? users : users.slice(0, initialLimit);

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-600 px-2">Private Chats</h3>
      {displayedUsers.map((user) => (
        <div
          key={`user-${user.id}`}
          onClick={() => handleChatClick(user, 'private')}
          className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-2 ${
            currentChat?.id === user.id && chatType === 'private' ? 'bg-gray-300' : ''
          }`}
        >
          <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
          <span className="text-sm">{user.username}</span>
        </div>
      ))}
      {users.length > initialLimit && (
        <button
          onClick={() => setShowAllUsers(!showAllUsers)}
          className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
        >
          {showAllUsers ? 'Show Less' : `Show More (${users.length - initialLimit} more)`}
        </button>
      )}
      {loading && <p className="text-sm text-gray-500">Loading messages...</p>}
    </div>
  );
};

export default PrivateChat;