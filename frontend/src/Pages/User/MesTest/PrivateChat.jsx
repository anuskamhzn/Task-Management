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
  recentSenders,
}) => {
  const [loading, setLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const initialLimit = 5;

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

  const mergedUsers = recentSenders
    .map((sender) => {
      const user = users.find((u) => u.id === sender.senderId) || {
        id: sender.senderId,
        username: sender.username,
        email: sender.email,
        avatar: 'https://example.com/default-avatar.jpg',
      };
      return {
        ...user,
        latestTimestamp: sender.latestTimestamp,
        unreadCount: sender.unreadCount,
      };
    })
    .sort((a, b) => new Date(b.latestTimestamp || 0) - new Date(a.latestTimestamp || 0));

  const allUsers = [
    ...mergedUsers,
    ...users
      .filter((u) => !mergedUsers.some((mu) => mu.id === u.id))
      .map((u) => ({
        ...u,
        latestTimestamp: '1970-01-01T00:00:00Z',
        unreadCount: 0,
      })),
  ];

  const displayedUsers = showAllUsers ? allUsers : allUsers.slice(0, initialLimit);

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-600 px-2">Private Chats</h3>
      {displayedUsers.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No recent chats</p>
      ) : (
        displayedUsers.map((user) => (
          <div
            key={`user-${user.id}`}
            onClick={() => handleChatClick(user, 'private')}
            className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-2 ${
              currentChat?.id === user.id && chatType === 'private' ? 'bg-gray-300' : ''
            }`}
          >
            <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
            <div className="flex-1 flex justify-between items-center">
              <span className={`text-sm ${user.unreadCount > 0 && currentChat?.id !== user.id ? 'font-bold' : ''}`}>
                {user.username}
              </span>
              {user.unreadCount > 0 && currentChat?.id !== user.id && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {user.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))
      )}
      {allUsers.length > initialLimit && (
        <button
          onClick={() => setShowAllUsers(!showAllUsers)}
          className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
        >
          {showAllUsers ? 'Show Less' : `Show More (${allUsers.length - initialLimit} more)`}
        </button>
      )}
      {loading && <p className="text-sm text-gray-500">Loading messages...</p>}
    </div>
  );
};

export default PrivateChat;