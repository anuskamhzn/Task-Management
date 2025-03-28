import React, { useEffect, useState, useMemo } from 'react';
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
  const initialLimit = 2;

  useEffect(() => {
    if (currentChat && chatType === 'private') {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/message/private/${currentChat.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(response.data.messages || []);

          if (socket) {
            socket.emit('markMessagesAsRead', { 
              conversationId: currentChat.id, 
              type: 'private' 
            });
          }
        } catch (error) {
          console.error('Error fetching private messages:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [currentChat, chatType, token, setMessages, socket]);

  const sortedUsers = useMemo(() => {
    // console.log('Recomputing sortedUsers with recentSenders:', recentSenders);
    const recentSenderIds = recentSenders.map(sender => sender.senderId);

    // Sort only users with recent activity, preserve others' order
    const recentUsers = users.filter(user => recentSenderIds.includes(user.id))
      .sort((a, b) => {
        const aTimestamp = recentSenders.find(s => s.senderId === a.id)?.latestTimestamp || 0;
        const bTimestamp = recentSenders.find(s => s.senderId === b.id)?.latestTimestamp || 0;
        return new Date(bTimestamp) - new Date(aTimestamp); // Most recent first
      });
    const otherUsers = users.filter(user => !recentSenderIds.includes(user.id)); // Keep original order
    return [...recentUsers, ...otherUsers];
  }, [users, recentSenders]);

  const displayedUsers = showAllUsers ? sortedUsers : sortedUsers.slice(0, initialLimit);

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-600 px-2">Private Chats</h3>
      {displayedUsers.map((user) => {
        const recentSender = recentSenders.find(s => s.senderId === user.id);
        const unreadCount = recentSender ? recentSender.unreadCount : 0;
        const isUnread = unreadCount > 0;

        // console.log(`Rendering ${user.username}: unreadCount=${unreadCount}, isUnread=${isUnread}`);

        return (
          <div
            key={`user-${user.id}`}
            onClick={() => handleChatClick(user, 'private')}
            className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center justify-between ${
              currentChat?.id === user.id && chatType === 'private' ? 'bg-gray-300' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
              <span className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-normal text-gray-700'}`}>
                {user.username}
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        );
      })}
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