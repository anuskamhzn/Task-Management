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

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-md font-semibold text-gray-600 px-2">Groups</h3>
      {groups.map((group) => (
        <div
          key={`group-${group.id}`}
          onClick={() => handleChatClick(group, 'group')}
          className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-2 ${
            currentChat?.id === group.id && chatType === 'group' ? 'bg-gray-300' : ''
          }`}
        >
          <img src={group.avatar} alt={group.name} className="w-6 h-6 rounded-full" />
          <span className="text-sm">{group.name}</span>
        </div>
      ))}
      {loading && <p className="text-sm text-gray-500">Loading messages...</p>}
    </div>
  );
};

export default GroupChat;