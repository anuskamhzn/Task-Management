import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../Components/Navigation/Navbar";
import Sidebar from "../../Components/Navigation/Sidebar";
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/auth';

// Singleton Socket.IO instance
let socket;

const Message = () => {
  const [auth] = useAuth();
  const [users, setUsers] = useState([]); // Private chat users
  const [groups, setGroups] = useState([]); // Group chats
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null); // Unified state for current user or group
  const [chatType, setChatType] = useState(null); // 'private' or 'group'
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (!socket && auth.token) {
      socket = io(process.env.REACT_APP_API || 'http://localhost:5000', {
        auth: { token: auth.token },
        transports: ['websocket', 'polling'],
      });
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/chat/added-users`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const mappedUsers = response.data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || 'https://example.com/default-avatar.jpg'
        }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/group-chat/my-groups`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const mappedGroups = response.data.groups.map(group => ({
          id: group._id,
          name: group.name,
          avatar: 'https://example.com/default-group-avatar.jpg' // Add a default group avatar
        }));
        setGroups(mappedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
    fetchGroups();

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('newMessage');
        socket.off('error');
      }
    };
  }, [auth.token]);

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      const fetchMessages = async () => {
        try {
          const url = chatType === 'private'
            ? `${process.env.REACT_APP_API}/api/message/private/${currentChat.id}`
            : `${process.env.REACT_APP_API}/api/group-chat/messages/${currentChat.id}`;
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          setMessages(response.data.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();

      // Join group room if it's a group chat
      if (chatType === 'group' && socket) {
        socket.emit('joinGroupRoom', currentChat.id);
      }
    }
  }, [currentChat, chatType, auth.token]);

  // Socket.IO real-time updates
// Handle real-time messages
useEffect(() => {
  if (socket) {
    socket.on('newMessage', (message) => {
      console.log('Received new message:', message);

      const senderId = message.sender?._id || (message.sender && message.sender.toString());
      const groupId = message.group?._id || (message.group && message.group.toString());

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) {
          return prev; // Avoid duplicates
        }

        if (chatType === 'private') {
          const recipientId = message.recipient?._id || (message.recipient && message.recipient.toString());
          if (
            (senderId === currentUser?._id && recipientId === currentChat?.id) ||
            (senderId === currentChat?.id && recipientId === currentUser?._id)
          ) {
            return [...prev, message];
          }
        } else if (chatType === 'group' && groupId && groupId === currentChat?.id) {
          return [...prev, message];
        }
        return prev;
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(`Error: ${error.message}`);
    });

    return () => {
      socket.off('newMessage');
      socket.off('error');
    };
  }
}, [currentUser, currentChat, chatType]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() && currentChat && socket) {
      const event = chatType === 'private' ? 'sendPrivateMessage' : 'sendGroupMessage';
      const payload = chatType === 'private'
        ? { recipientId: currentChat.id, content: messageInput }
        : { groupId: currentChat.id, content: messageInput };

      socket.emit(event, payload);
      setMessageInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatClick = (chat, type) => {
    setCurrentChat(chat);
    setChatType(type);
  };

  const handleAddUser = async () => {
    if (!emailInput.trim()) {
      alert("Please enter a valid email.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/chat/add`,
        { email: emailInput },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (response.data.message.includes("User added")) {
        setUsers([...users, response.data.user]);
        setShowAddUserModal(false);
        setEmailInput('');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user.");
    }
  };

  const handleAddGroup = async () => {
    if (!groupNameInput.trim()) {
      alert("Please enter a group name.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/create`,
        { name: groupNameInput },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (response.data.success) {
        setGroups([...groups, { id: response.data.group._id, name: response.data.group.name, avatar: 'https://example.com/default-group-avatar.jpg' }]);
        setShowAddGroupModal(false);
        setGroupNameInput('');
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  const handleResetChat = () => {
    setCurrentChat(null);
    setChatType(null);
    setMessages([]);
  };

  return (
    <div>
      <div className="flex bg-gray-50">
        <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex flex-1">
            <aside className="w-64 bg-gray-200 text-black p-4">
              <div className="flex justify-between items-center mb-6">
              <h2
                  className="text-xl font-bold cursor-pointer"
                  onClick={handleResetChat}
                  title="Reset to initial state"
                >
                  Chats
                </h2>
                <div className="flex space-x-2">
                  <button 
                    className="text-white bg-blue-500 px-2 py-1 rounded-full" 
                    onClick={() => setShowAddUserModal(true)}
                    title="Add User"
                  >
                    +U
                  </button>
                  <button 
                    className="text-white bg-green-500 px-2 py-1 rounded-full" 
                    onClick={() => setShowAddGroupModal(true)}
                    title="Add Group"
                  >
                    +G
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {/* Private Users */}
                {users.map((user) => (
                  <div
                    key={`user-${user.id}`}
                    onClick={() => handleChatClick(user, 'private')}
                    className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-4 ${currentChat?.id === user.id && chatType === 'private' ? 'bg-gray-300' : ''}`}
                  >
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                    <span>{user.username}</span>
                  </div>
                ))}
                {/* Groups */}
                {groups.map((group) => (
                  <div
                    key={`group-${group.id}`}
                    onClick={() => handleChatClick(group, 'group')}
                    className={`cursor-pointer hover:bg-gray-300 p-2 rounded-md flex items-center space-x-4 ${currentChat?.id === group.id && chatType === 'group' ? 'bg-gray-300' : ''}`}
                  >
                    <img src={group.avatar} alt={group.name} className="w-8 h-8 rounded-full" />
                    <span>{group.name}</span>
                  </div>
                ))}
              </div>
            </aside>
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentChat ? `Chat with ${currentChat.name || currentChat.username}${chatType === 'group' ? '' : ''}` : 'Select a Chat'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto mb-4 bg-white p-4 rounded-lg shadow-md">
                {currentChat ? (
                  messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`flex ${msg.sender?._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-center space-x-3">
                            {msg.sender?._id !== currentUser?._id && (
                              <img
                                src={chatType === 'private' ? currentChat.avatar : msg.sender?.avatar}
                                alt={chatType === 'private' ? currentChat.username : msg.sender?.username}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div
                              className={`max-w-xs p-3 rounded-lg ${
                                msg.sender?._id === currentUser?._id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
                              }`}
                            >
                              <p>{msg.content}</p>
                            </div>
                            {msg.sender?._id === currentUser?._id && (
                              <img
                                src={currentUser.avatar}
                                alt={currentUser.username}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-center text-gray-500">Select a chat to start messaging.</p>
                )}
                <div ref={messagesEndRef} />
              </div>
              {currentChat && (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 p-3 rounded-lg border border-gray-300"
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg relative w-96">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
              onClick={() => setShowAddUserModal(false)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4">Add User</h3>
            <input 
              type="email" 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter user's email"
            />
            <button onClick={handleAddUser} className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg">Add</button>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg relative w-96">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
              onClick={() => setShowAddGroupModal(false)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4">Create Group</h3>
            <input 
              type="text" 
              value={groupNameInput} 
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter group name"
            />
            <button onClick={handleAddGroup} className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg">Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;