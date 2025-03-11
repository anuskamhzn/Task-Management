import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import AddGroupMembers from './AddGroupMembers';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';

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
  const [PhotoPreviewUrl,setPhotoPreviewUrl] = useState(null);

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

    // Handle photo selection and generate preview URL
  const handlePhotoChange = (e) => {
    const selectedPhoto = e.target.files[0];
    if (selectedPhoto) {
      setPhoto(selectedPhoto);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result); // Set preview URL for display
      };
      reader.readAsDataURL(selectedPhoto);
      setShowAttachmentOptions(false);
    }
  };

  useEffect(() => {
    if (!socket && auth.token) {
      socket = io(process.env.REACT_APP_API || 'http://localhost:5000', {
        auth: { token: auth.token },
        transports: ['websocket', 'polling'],
      });

      // Debug socket connection
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
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
      // Join the appropriate room based on chat type
      if (chatType === 'group') {
        socket.emit('joinGroupRoom', currentChat.id);
        socket.on('joinedRoom', ({ groupId }) => {
          console.log(`Joined group room: ${groupId}`);
        });
      }
      // For private chats, the backend automatically joins the user's own room (socket.user.id)
      // No additional join is needed unless you want to join the recipient's room explicitly
    }

    if (socket) {
      socket.on('newMessage', (message) => {
        console.log('Received new message on frontend:', message);
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
    setCurrentChat(chat);
    setChatType(type);
    setMessages([]); // Clear messages when switching chats
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
        // Note: Backend currently ignores photo and file for group messages
        // If you want to support attachments in group chats, the backend needs to handle them
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
      setShowAttachmentOptions(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // Rest of the component (render logic, modals, etc.) remains unchanged
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-800 text-white">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 bg-gray-200 text-black p-4">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-bold cursor-pointer"
                  onClick={() => {
                    setCurrentChat(null);
                    setChatType(null);
                    setMessages([]);
                  }}
                  title="Reset to initial state"
                >
                  Chats
                </h2>
                <div className="flex space-x-2">
                  <button
                    className="text-white bg-blue-500 px-1 py-1 rounded-full text-xs"
                    onClick={() => setShowAddUserModal(true)}
                    title="Add User"
                  >
                    +U
                  </button>
                  <button
                    className="text-white bg-green-500 px-1 py-1 rounded-full text-xs"
                    onClick={() => setShowAddGroupModal(true)}
                    title="Add Group"
                  >
                    +G
                  </button>
                </div>
              </div>
              <div className="space-y-2">
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
                <hr className="border-gray-300 my-2" />
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
              </div>
            </aside>
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentChat
                    ? `Chat with ${currentChat.name || currentChat.username}${chatType === 'group' ? '' : ''}`
                    : 'Select a Chat'}
                </h2>
              </div>
              <div
                className="flex-1 bg-white p-4 rounded-lg shadow-md overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {currentChat ? (
                  messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const photoBase64 = msg.photo?.data?.data
                          ? arrayBufferToBase64(msg.photo.data.data)
                          : msg.photo?.data;
                        const fileBase64 = msg.file?.data?.data
                          ? arrayBufferToBase64(msg.file.data.data)
                          : msg.file?.data;
  
                        const isSender = msg.sender?._id === currentUser?._id;
  
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`flex items-center space-x-3 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              {!isSender && (
                                <img
                                  src={chatType === 'private' ? currentChat.avatar : msg.sender?.avatar}
                                  alt={chatType === 'private' ? currentChat.username : msg.sender?.username}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div className="flex flex-col">
                                <div
                                  className={`max-w-xs p-3 rounded-lg ${
                                    isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                                  }`}
                                >
                                  {msg.content && <p className="break-words">{msg.content}</p>}
                                  {msg.photo?.data && (
                                    <div className="mt-2">
                                      <img
                                        src={`data:${msg.photo.contentType};base64,${photoBase64}`}
                                        alt="Attached photo"
                                        className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
                                        onClick={() => setSelectedImage(photoBase64)}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Photo sent by {isSender ? 'You' : msg.sender?.username}
                                      </p>
                                    </div>
                                  )}
                                  {msg.file?.data && (
                                    <div className="mt-2">
                                      <a
                                        href={`data:${msg.file.contentType};base64,${fileBase64}`}
                                        download={msg.file.fileName}
                                        className="inline-block bg-gray-100 p-2 rounded-lg shadow-md text-blue-600 hover:bg-gray-200 transition"
                                      >
                                        <span className="mr-2">📎</span> {msg.file.fileName}
                                      </a>
                                      <p className="text-xs text-gray-500 mt-1">
                                        File sent by {isSender ? 'You' : msg.sender?.username}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isSender && (
                                <img
                                  src={currentUser.avatar}
                                  alt={currentUser.username}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <p className="text-center text-gray-500">Select a chat to start messaging.</p>
                )}
                <div ref={messagesEndRef} />
              </div>
              {currentChat && (
                <div className="mt-4 flex items-center space-x-3 relative">
                  <div className="relative flex-1">
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
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
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
                    {showAttachmentOptions && (
                      <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-48 z-10">
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
                            onChange={(e) => {
                              setPhoto(e.target.files[0]);
                              setShowAttachmentOptions(false);
                            }}
                            className="hidden"
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
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                    disabled={!messageInput.trim() && !photo && !file}
                  >
                    Send
                  </button>
                </div>
              )}
              {currentChat && (photo || file) && (
                <div className="mt-2 text-sm text-gray-600">
                  {photo && (
                    <div className="flex items-center space-x-2">
                      <span>Photo selected: {photo.name}</span>
                      <button
                        onClick={() => setPhoto(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {file && (
                    <div className="flex items-center space-x-2">
                      <span>File selected: {file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
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
              src={`data:image/jpeg;base64,${selectedImage}`} // Adjust contentType if needed
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
  
      {showAddUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg relative w-80">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddUserModal(false)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-3">Add User</h3>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter user's email"
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
              className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}
  
      {showAddGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg relative w-80">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddGroupModal(false)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-3">Create Group</h3>
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Enter group name"
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
              className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg text-sm"
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