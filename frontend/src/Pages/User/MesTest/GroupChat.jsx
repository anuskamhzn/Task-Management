import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GroupChat = ({
  groups,
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
  const [showAllGroups, setShowAllGroups] = useState(false);
  const initialLimit = 2; // Show 5 groups initially

  // Fetch group messages
  useEffect(() => {
    if (currentChat && chatType === 'group') {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/group-chat/messages/${currentChat.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(response.data.messages || []);
        } catch (error) {
          console.error('Error fetching group messages:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();

      if (socket) {
        socket.emit('joinGroupRoom', currentChat.id);
      }
    }
  }, [currentChat, chatType, token, setMessages, socket]);

  // Determine the groups to display based on the toggle state
  const displayedGroups = showAllGroups ? groups : groups.slice(0, initialLimit);

  // Function to generate a random color based on the group name
  const getRandomColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-600 px-2">Group Chats</h3>
      {displayedGroups.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No groups yet</p>
      ) : (
        displayedGroups.map((group) => (
          <div
            key={`group-${group.id}`}
            onClick={() => handleChatClick(group, 'group')}
            className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-2 ${
              currentChat?.id === group.id && chatType === 'group' ? 'bg-gray-300' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full ${getRandomColor(group.name)} flex items-center justify-center text-white font-semibold text-sm`}>
              {group.initials}
            </div>

            <div className="flex-1 flex justify-between items-center">
              <span className={`text-sm ${group.unreadCount > 0 && currentChat?.id !== group.id ? 'font-bold' : ''}`}>
                {group.name}
              </span>
              {group.unreadCount > 0 && currentChat?.id !== group.id && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {group.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))
      )}
      {groups.length > initialLimit && (
        <button
          onClick={() => setShowAllGroups(!showAllGroups)}
          className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
        >
          {showAllGroups ? 'Show Less' : `Show More (${groups.length - initialLimit} more)`}
        </button>
      )}
      {loading && <p className="text-sm text-gray-500">Loading messages...</p>}
    </div>
  );
};

export default GroupChat;