import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import AddGroupMembers from './AddGroupMembers';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

let socket;

const Message = () => {
  const [auth] = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [chatType, setChatType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [newGroupId, setNewGroupId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [file, setFile] = useState(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  const handlePhotoChange = (selectedPhoto) => {
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

  const removeAttachment = (type) => {
    if (type === 'photo') {
      setPhoto(null);
      setPhotoPreviewUrl(null);
    }
    if (type === 'file') setFile(null);
  };

  useEffect(() => {
    if (!socket && auth.token) {
      socket = io(process.env.REACT_APP_API || 'http://localhost:5000', {
        auth: { token: auth.token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        // console.log('Socket connected:', socket.id);
      });
      socket.on('connect_error', (error) => {
        // console.error('Socket connection error:', error);
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
          avatar: user.avatar || 'https://example.com/default-avatar.jpg',
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
          avatar: 'https://example.com/default-group-avatar.jpg',
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

  useEffect(() => {
    if (socket && currentUser?._id && currentChat) {
      // Force re-join the room even for the same chat to ensure messages are updated
      if (chatType === 'group') {
        socket.emit('joinGroupRoom', currentChat.id);
        socket.on('joinedRoom', ({ groupId }) => {
          // console.log(`Joined group room: ${groupId}`);
          // Optionally fetch historical messages here if supported by your backend
          // Example: fetchMessages(currentChat.id, chatType);
        });
      } else if (chatType === 'private') {
        // For private chats, you might need to emit a join event if your backend requires it
        // socket.emit('joinPrivateRoom', { userId: currentChat.id, myId: currentUser._id });
      }

      socket.on('newMessage', (message) => {
        // console.log('Received new message on frontend:', message);
        const senderId = message.sender?._id || (message.sender && message.sender.toString());
        const groupId = message.group?._id || (message.group && message.group.toString());
        const recipientId = message.recipient?._id || (message.recipient && message.recipient.toString());

        setMessages((prev) => {
          const isDuplicate = prev.some((msg) => msg._id === message._id);
          if (isDuplicate) return prev;

          if (chatType === 'private') {
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
        socket.off('joinedRoom');
      };
    }
  }, [currentUser, currentChat, chatType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatClick = (chat, type) => {
    // Force a re-render or re-join by checking if the chat is the same
    if (currentChat && currentChat.id === chat.id) {
      // If the same chat is clicked, clear messages and re-set to trigger useEffect
      setMessages([]);
      setCurrentChat(null); // Temporarily unset to force re-render
      setTimeout(() => {
        setCurrentChat(chat);
        setChatType(type);
      }, 0);
    } else {
      setCurrentChat(chat);
      setChatType(type);
      setMessages([]); // Clear messages for new chat
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !photo && !file) || !currentChat || !socket) return;

    try {
      if (chatType === 'private') {
        const payload = { recipientId: currentChat.id };
        if (messageInput.trim()) payload.content = messageInput;
        if (photo) {
          payload.photo = {
            data: await fileToBase64(photo),
            contentType: photo.type,
          };
        }
        if (file) {
          payload.file = {
            data: await fileToBase64(file),
            contentType: file.type,
            fileName: file.name,
          };
        }
        socket.emit('sendPrivateMessage', payload);
      } else if (chatType === 'group') {
        const payload = { groupId: currentChat.id };
        if (messageInput.trim()) payload.content = messageInput;
        if (photo) {
          payload.photo = {
            data: await fileToBase64(photo),
            contentType: photo.type,
          };
        }
        if (file) {
          payload.file = {
            data: await fileToBase64(file),
            contentType: file.type,
            fileName: file.name,
          };
        }
        socket.emit('sendGroupMessage', payload);
      }

      setMessageInput('');
      setPhoto(null);
      setFile(null);
      setPhotoPreviewUrl(null);
      setShowAttachmentOptions(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-800 text-white shrink-0">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 bg-gray-100 text-gray-900 p-4 shrink-0 border-r border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => { handleChatClick(null, null); setMessages([]); }}
                  title="Reset to initial state"
                >
                  Chats
                </h2>
                <div className="flex space-x-2">
                  <button
                    className="text-white bg-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => setShowAddUserModal(true)}
                    title="Add User"
                    aria-label="Add User"
                  >
                    + User
                  </button>
                  <button
                    className="text-white bg-green-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                    onClick={() => setShowAddGroupModal(true)}
                    title="Add Group"
                    aria-label="Add Group"
                  >
                    + Group
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No users available</p>
                ) : (
                  <>
                    <PrivateChat
                      users={users}
                      currentChat={currentChat}
                      chatType={chatType}
                      handleChatClick={handleChatClick}
                      setMessages={setMessages}
                      socket={socket}
                      token={auth.token}
                      currentUser={currentUser}
                    />
                  </>
                )}
                <hr className="border-gray-300 my-4" />
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No groups available</p>
                ) : (
                  <>
                    <GroupChat
                      groups={groups}
                      currentChat={currentChat}
                      chatType={chatType}
                      handleChatClick={handleChatClick}
                      setMessages={setMessages}
                      socket={socket}
                      token={auth.token}
                      currentUser={currentUser}
                    />
                  </>
                )}
              </div>
            </aside>

            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentChat
                    ? `Chat with ${currentChat.name || currentChat.username}${chatType === 'group' ? ' (Group)' : ''}`
                    : 'Select a Chat'}
                </h2>
              </div>
              <MessageDisplay
                currentChat={currentChat}
                chatType={chatType}
                messages={messages}
                currentUser={currentUser}
                arrayBufferToBase64={arrayBufferToBase64}
                messagesEndRef={messagesEndRef}
              />
              {currentChat && (
                <MessageInput
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  photo={photo}
                  setPhoto={setPhoto}
                  file={file}
                  setFile={setFile}
                  handleSendMessage={handleSendMessage}
                  photoPreviewUrl={photoPreviewUrl}
                  setPhotoPreviewUrl={setPhotoPreviewUrl}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg relative w-80 shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setShowAddUserModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add User</h3>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user's email"
              aria-label="User email input"
            />
            <button
              onClick={async () => {
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
              }}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg relative w-80 shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setShowAddGroupModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Group</h3>
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
              aria-label="Group name input"
            />
            <button
              onClick={async () => {
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
                    const newGroup = {
                      id: response.data.group._id,
                      name: response.data.group.name,
                      avatar: 'https://example.com/default-group-avatar.jpg',
                    };
                    setGroups([...groups, newGroup]);
                    setNewGroupId(response.data.group._id);
                    setShowAddMembersModal(true);
                    setShowAddGroupModal(false);
                    setGroupNameInput('');
                  }
                } catch (error) {
                  console.error("Error creating group:", error);
                  alert("Failed to create group.");
                }
              }}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {showAddMembersModal && newGroupId && (
        <AddGroupMembers
          groupId={newGroupId}
          onClose={() => setShowAddMembersModal(false)}
          onMembersAdded={(updatedGroup) => {
            setGroups((prevGroups) =>
              prevGroups.map((group) =>
                group.id === updatedGroup._id ? { ...group, members: updatedGroup.members } : group
              )
            );
            setShowAddMembersModal(false);
            setNewGroupId(null);
          }}
        />
      )}
    </div>
  );
};

export default Message;