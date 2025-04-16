import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import AddGroupMembers from './AddGroupMembers';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import { NavLink } from 'react-router-dom';
import UserInfom from '../../User/MesTest/UserInfo/UserInfo';
import Manage from '../../User/MesTest/GroupManage/Manage';
import ChatList from '../../User/MesTest/ChatList';
import toast from 'react-hot-toast';

const Message = () => {
  const [auth, setAuth] = useAuth();
  const socketRef = useRef(null);
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
  const [replyToMessageId, setReplyToMessageId] = useState(null);
  const [showUserInfoSidebar, setShowUserInfoSidebar] = useState(false);
  const [showGroupInfoSidebar, setShowGroupInfoSidebar] = useState(false);
  const [recentSenders, setRecentSenders] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]); // New state for recent groups
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const lastMarkedChatId = useRef(null);

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

  const fetchMessages = async (chatId, type) => {
    try {
      const endpoint =
        type === 'group'
          ? `${process.env.REACT_APP_API}/api/group-chat/messages/${chatId}`
          : `${process.env.REACT_APP_API}/api/message/private/${chatId}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const sortedMessages = (response.data.messages || []).sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchRecentSenders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/message/recent-private-senders`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const sortedSenders = (response.data.recentSenders || []).sort(
        (a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
      );
      setRecentSenders(sortedSenders);
      return sortedSenders;
    } catch (error) {
      console.error('Error fetching recent senders:', error);
      setRecentSenders([]);
      return [];
    }
  };

  const fetchRecentGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/group-chat/recent-group-senders`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const sortedGroups = (response.data.recentGroups || []).sort(
        (a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
      );
      setRecentGroups(sortedGroups);
      return sortedGroups;
    } catch (error) {
      console.error('Error fetching recent groups:', error);
      setRecentGroups([]);
      return [];
    }
  };

  const initializeSocket = () => {
    if (socketRef.current) {
      socketRef.current.emit('logout');
      socketRef.current.disconnect();
    }
    if (auth.token) {
      socketRef.current = io(process.env.REACT_APP_API, {
        auth: { token: auth.token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        // console.log('Socket connected with user:', currentUser?._id);
      });

      socketRef.current.on('connect_error', (error) => {
        toast.error('Failed to connect to chat server');
      });

      socketRef.current.on('error', (error) => {
        toast.error(`Chat error: ${error.message}`);
      });
    }
  };

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.emit('logout');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setAuth({ token: null, user: null });
    setMessages([]);
    setCurrentChat(null);
    setChatType(null);
    setCurrentUser(null);
    setRecentSenders([]);
    setRecentGroups([]);
    setUsers([]);
    setGroups([]);
    setIsDataLoaded(false);
  };

  useEffect(() => {
    initializeSocket();

    const fetchInitialData = async () => {
      try {
        const [currentUserRes, usersRes, groupsRes, recentSendersRes, recentGroupsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(`${process.env.REACT_APP_API}/api/chat/added-users`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(`${process.env.REACT_APP_API}/api/group-chat/my-groups`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          fetchRecentSenders(),
          fetchRecentGroups(),
        ]);

        setCurrentUser(currentUserRes.data);
        setUsers(
          usersRes.data.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            initials: user.initials || user.name.substring(0, 2).toUpperCase(),
            avatar: user.avatar || 'https://example.com/default-avatar.jpg',
          }))
        );
        setGroups(
          groupsRes.data.groups.map((group) => ({
            id: group._id,
            name: group.name,
            avatar: 'https://example.com/default-group-avatar.jpg',
            members: group.members || [],
            initials: group.initials || group.name.substring(0, 2).toUpperCase(),
          }))
        );
        setRecentSenders(recentSendersRes);
        setRecentGroups(recentGroupsRes);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setIsDataLoaded(true);
      }
    };

    if (auth.token) {
      fetchInitialData();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('newMessage');
        socketRef.current.off('newMessageReply');
        socketRef.current.off('recentSenderUpdate');
        socketRef.current.off('recentGroupUpdate');
        socketRef.current.off('error');
      }
    };
  }, [auth.token, setAuth]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!socketRef.current || !currentChat || !chatType || messages.length === 0) {
      return;
    }

    if (lastMarkedChatId.current === currentChat.id) {
      return;
    }

    const hasUnreadMessages = messages.some(
      (msg) => !msg.isRead && msg.sender?._id !== currentUser?._id
    );

    if (hasUnreadMessages) {
      socketRef.current.emit(
        'markMessagesAsRead',
        {
          conversationId: currentChat.id,
          type: chatType,
        },
        () => {
          // console.log('markMessagesAsRead callback received', { chatId: currentChat.id });
        }
      );
      lastMarkedChatId.current = currentChat.id;

      if (chatType === 'private') {
        setRecentSenders((prev) =>
          prev.map((sender) =>
            sender.senderId === currentChat.id
              ? { ...sender, unreadCount: 0 }
              : sender
          )
        );
      } else if (chatType === 'group') {
        setRecentGroups((prev) =>
          prev.map((group) =>
            group.groupId === currentChat.id
              ? { ...group, unreadCount: 0 }
              : group
          )
        );
      }
    }

    return () => {
      lastMarkedChatId.current = null;
    };
  }, [currentChat, chatType, messages, currentUser]);

  useEffect(() => {
    if (socketRef.current && currentUser?._id && isDataLoaded) {
      if (currentChat && chatType === 'group') {
        socketRef.current.emit('joinGroupRoom', currentChat.id);
        socketRef.current.on('joinedRoom', ({ groupId }) => {
          // console.log('Joined group room:', groupId);
        });
      }

      const handleRecentSenderUpdate = (update) => {
        setRecentSenders((prev) => {
          const existing = prev.find((sender) => sender.senderId === update.senderId);
          const newSender = {
            senderId: update.senderId,
            name: update.name,
            email: update.email,
            initials: update.initials,
            latestTimestamp: update.latestTimestamp,
            unreadCount: update.unreadCount,
            totalCount: update.totalCount,
          };

          if (update.totalCount === 0) {
            return prev.filter((sender) => sender.senderId !== update.senderId);
          }

          if (existing) {
            return [
              newSender,
              ...prev.filter((sender) => sender.senderId !== update.senderId),
            ].sort((a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp));
          }

          return [newSender, ...prev].sort((a, b) =>
            new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
          );
        });
      };

      const handleRecentGroupUpdate = (update) => {
        setRecentGroups((prev) => {
          const existing = prev.find((group) => group.groupId === update.groupId);
          const newGroup = {
            groupId: update.groupId,
            groupName: update.groupName,
            latestTimestamp: update.latestTimestamp,
            unreadCount: update.unreadCount,
            totalCount: update.totalCount,
            senders: update.senders || [],
          };

          if (update.totalCount === 0) {
            return prev.filter((group) => group.groupId !== update.groupId);
          }

          if (existing) {
            return [
              newGroup,
              ...prev.filter((group) => group.groupId !== update.groupId),
            ].sort((a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp));
          }

          return [newGroup, ...prev].sort((a, b) =>
            new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
          );
        });
      };

      const handleNewMessage = (message) => {
        const senderId = message.sender?._id || (message.sender && message.sender.toString());
        const groupId = message.group?._id || (message.group && message.group.toString());
        const recipientId = message.recipient?._id || (message.recipient && message.recipient.toString());

        setMessages((prev) => {
          const isDuplicate = prev.some((msg) => msg._id === message._id);
          if (isDuplicate) return prev;

          let updatedMessages = [...prev];

          if (chatType === 'private') {
            if (
              (senderId === currentUser?._id && recipientId === currentChat?.id) ||
              (senderId === currentChat?.id && recipientId === currentUser?._id)
            ) {
              updatedMessages.push(message);
            }
          } else if (chatType === 'group' && groupId && groupId === currentChat?.id) {
            updatedMessages.push(message);
          }

          return updatedMessages.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
          );
        });
      };

      const handleMessageDeleted = (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? { ...msg, ...updatedMessage } : msg
          )
        );
      };

      const handleMessageEdited = (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? { ...msg, ...updatedMessage } : msg
          )
        );
      };

      socketRef.current.on('memberAdded', (data) => {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === data.groupId
              ? { ...group, members: [...(group.members || []), ...data.newMembers] }
              : group
          )
        );
        if (showGroupInfoSidebar && currentChat.id === data.groupId) {
          setShowGroupInfoSidebar(false);
          setTimeout(() => setShowGroupInfoSidebar(true), 0);
        }
      });

      socketRef.current.on('memberRemoved', (data) => {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === data.groupId
              ? {
                  ...group,
                  members: (group.members || []).filter((m) => m._id !== data.memberId),
                }
              : group
          )
        );
      });

      socketRef.current.on('memberQuit', (data) => {
        if (data.memberId === currentUser._id) {
          setGroups((prev) => prev.filter((group) => group.id !== data.groupId));
          setRecentGroups((prev) => prev.filter((group) => group.groupId !== data.groupId));
          setCurrentChat(null);
          setChatType(null);
          setMessages([]);
          setShowGroupInfoSidebar(false);
        } else {
          setGroups((prev) =>
            prev.map((group) =>
              group.id === data.groupId
                ? {
                    ...group,
                    members: (group.members || []).filter((m) => m._id !== data.memberId),
                  }
                : group
            )
          );
          if (showGroupInfoSidebar && currentChat.id === data.groupId) {
            setShowGroupInfoSidebar(false);
            setTimeout(() => setShowGroupInfoSidebar(true), 0);
          }
        }
      });

      socketRef.current.on('groupDeleted', (data) => {
        setGroups((prev) => prev.filter((group) => group.id !== data.groupId));
        setRecentGroups((prev) => prev.filter((group) => group.groupId !== data.groupId));
        if (currentChat?.id === data.groupId) {
          setCurrentChat(null);
          setChatType(null);
          setMessages([]);
          setShowGroupInfoSidebar(false);
        }
      });

      socketRef.current.on('recentSenderUpdate', handleRecentSenderUpdate);
      socketRef.current.on('recentGroupUpdate', handleRecentGroupUpdate);
      socketRef.current.on('newMessage', handleNewMessage);
      socketRef.current.on('newMessageReply', handleNewMessage);
      socketRef.current.on('newGroupMessageReply', handleNewMessage);
      socketRef.current.on('messageDeleted', handleMessageDeleted);
      socketRef.current.on('groupMessageDeleted', handleMessageDeleted);
      socketRef.current.on('messageEdited', handleMessageEdited);
      socketRef.current.on('groupMessageEdited', handleMessageEdited);

      return () => {
        socketRef.current.off('recentSenderUpdate', handleRecentSenderUpdate);
        socketRef.current.off('recentGroupUpdate', handleRecentGroupUpdate);
        socketRef.current.off('newMessage', handleNewMessage);
        socketRef.current.off('newMessageReply', handleNewMessage);
        socketRef.current.off('newGroupMessageReply', handleNewMessage);
        socketRef.current.off('messageDeleted', handleMessageDeleted);
        socketRef.current.off('groupMessageDeleted', handleMessageDeleted);
        socketRef.current.off('messageEdited', handleMessageEdited);
        socketRef.current.off('groupMessageEdited', handleMessageEdited);
        socketRef.current.off('joinedRoom');
        socketRef.current.off('memberAdded');
        socketRef.current.off('memberRemoved');
        socketRef.current.off('memberQuit');
        socketRef.current.off('groupDeleted');
      };
    }
  }, [currentUser, currentChat, chatType, isDataLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInfoClick = (e) => {
    e.preventDefault();
    setShowUserInfoSidebar(!showUserInfoSidebar);
  };

  const handleCloseUserInfo = () => {
    setShowUserInfoSidebar(false);
  };

  const handleGroupInfoClick = (e) => {
    e.preventDefault();
    setShowGroupInfoSidebar(!showGroupInfoSidebar);
  };

  const handleCloseGroupInfo = () => {
    setShowGroupInfoSidebar(false);
  };

  const handleChatClick = (chat, type) => {
    if (currentChat && currentChat?.id === chat?.id) {
      setMessages([]);
      setCurrentChat(null);
      setShowUserInfoSidebar(false);
      setTimeout(() => {
        setCurrentChat(chat);
        setChatType(type);
        fetchMessages(chat?.id, type);
      }, 0);
    } else {
      setCurrentChat(chat);
      setChatType(type);
      setMessages([]);
      setShowUserInfoSidebar(false);
      fetchMessages(chat?.id, type);
    }
  };

  const handleReply = (messageId) => {
    setReplyToMessageId(messageId);
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !photo && !file) || !currentChat || !socketRef) return;

    try {
      const payload = chatType === 'group' ? { groupId: currentChat.id } : { recipientId: currentChat.id };
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

      if (replyToMessageId) {
        payload.parentMessageId = replyToMessageId;
      }
      const MAX_SIZE = 7.5 * 1024 * 1024; // 7.5MB to account for Base64 overhead

      if (photo && photo.size > MAX_SIZE) {
        // console.log('Photo exceeds limit:', photo.size, '>', MAX_SIZE);
        toast.error('Photo exceeds 7.5MB limit');
        return;
      }
      if (file && file.size > MAX_SIZE) {
        // console.log('File exceeds limit:', file.size, '>', MAX_SIZE);
        toast.error('File exceeds 7.5MB limit');
        return;
      }

      // if (chatType === 'private') {
      //   socket.emit(replyToMessageId ? 'sendPrivateMessageReply' : 'sendPrivateMessage', payload);
      // } else if (chatType === 'group') {
      //   socket.emit(replyToMessageId ? 'sendGroupMessageReply' : 'sendGroupMessage', payload);
      // }

      // Emit the message via socket and listen for response
      const event = chatType === 'private'
        ? (replyToMessageId ? 'sendPrivateMessageReply' : 'sendPrivateMessage')
        : (replyToMessageId ? 'sendGroupMessageReply' : 'sendGroupMessage');

      socketRef.current.emit(event, payload, (response) => {
        if (response && !response.success) {
          // Display error from backend using toast
          toast.error(response.message || 'Failed to send message');
        }
      });

      setMessageInput('');
      setPhoto(null);
      setFile(null);
      setPhotoPreviewUrl(null);
      setShowAttachmentOptions(false);
      setReplyToMessageId(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  

  const handleDeleteMessage = (messageId) => {
    if (!socketRef.current || !currentChat) return;

    const event = chatType === 'group' ? 'deleteGroupMessage' : 'deletePrivateMessage';
    socketRef.current.emit(event, { messageId });
  };

  const handleEditMessage = (messageId, newContent) => {
    if (!socketRef.current || !currentChat || !newContent.trim()) return;

    const event = chatType === 'group' ? 'editGroupMessage' : 'editPrivateMessage';
    socketRef.current.emit(event, { messageId, content: newContent });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-800 text-white shrink-0">
          <Sidebar onLogout={handleLogout} />
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            {isDataLoaded ? (
              <ChatList
                key={users.map(u => u.id).join('-')}
                users={users}
                groups={groups}
                currentChat={currentChat}
                chatType={chatType}
                handleChatClick={handleChatClick}
                setMessages={setMessages}
                socket={socketRef.current}
                token={auth.token}
                currentUser={currentUser}
                setShowAddUserModal={setShowAddUserModal}
                setShowAddGroupModal={setShowAddGroupModal}
                recentSenders={recentSenders}
                recentGroups={recentGroups}
              />
            ) : (
              <div className="w-64 text-gray-900 p-4 shrink-0 border-r border-gray-300">
                <p className="text-sm text-gray-500">Loading chats...</p>
              </div>
            )}
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentChat ? (
                    <>
                      Chat with{' '}
                      {chatType !== 'group' ? (
                        <button
                          onClick={handleUserInfoClick}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {currentChat.name || currentChat.name}
                        </button>
                      ) : (
                        currentChat.name || currentChat.name
                      )}
                    </>
                  ) : (
                    'Select a Chat'
                  )}
                </h2>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentChat && chatType === 'group' ? (
                    <NavLink to="" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                      <button onClick={handleGroupInfoClick} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                        Manage
                      </button>
                    </NavLink>
                  ) : null}
                </h2>
              </div>
              <MessageDisplay
                currentChat={currentChat}
                chatType={chatType}
                messages={messages}
                currentUser={currentUser}
                arrayBufferToBase64={arrayBufferToBase64}
                messagesEndRef={messagesEndRef}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
                onEdit={handleEditMessage}
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
                  replyToMessageId={replyToMessageId}
                  setReplyToMessageId={setReplyToMessageId}
                  messages={messages}
                />
              )}
            </div>
            {showUserInfoSidebar && currentChat && chatType !== 'group' && (
              <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto border-l border-gray-700 transition-all duration-300">
                <button
                  onClick={handleCloseUserInfo}
                  className="text-white mb-4 hover:text-gray-300"
                >
                  ×
                </button>
                <UserInfom userId={currentChat.id} />
              </div>
            )}
            {showGroupInfoSidebar && currentChat && chatType === 'group' && (
              <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto border-l border-gray-700 transition-all duration-300">
                <button
                  onClick={handleCloseGroupInfo}
                  className="text-white mb-4 hover:text-gray-300 text-xl"
                >
                  ×
                </button>
                <Manage
                  groupId={currentChat.id}
                  currentUser={currentUser}
                  token={auth.token}
                  socket={socketRef.current}
                  onGroupUpdate={(updatedGroup) => {
                    setGroups((prev) =>
                      prev.map((group) =>
                        group.id === updatedGroup._id
                          ? { ...group, members: updatedGroup.members || group.members || [] }
                          : group
                      )
                    );
                  }}
                  onGroupDeleted={(groupId) => {
                    setGroups((prev) => prev.filter((group) => group.id !== groupId));
                    setRecentGroups((prev) => prev.filter((group) => group.groupId !== groupId));
                    setCurrentChat(null);
                    setChatType(null);
                    setMessages([]);
                    setShowGroupInfoSidebar(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

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
                  toast.error("Please enter a valid email.");
                  return;
                }
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_API}/api/chat/add`,
                    { email: emailInput },
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                  );
                  if (response.data.message.includes("User added")) {
                    const newUser = {
                      id: response.data.user._id.toString(),
                      name: response.data.user.name || response.data.user.email.split('@')[0],
                      email: response.data.user.email,
                      initials: response.data.user.initials || response.data.user.name.substring(0, 2).toUpperCase(),
                      avatar: response.data.user.avatar || 'https://example.com/default-avatar.jpg',
                    };
                    setUsers((prev) => {
                      if (prev.some((u) => u.id === newUser.id)) {
                        return prev;
                      }
                      return [...prev, newUser];
                    });
                    setShowAddUserModal(false);
                    setEmailInput('');
                    toast.success('User added successfully!');
                  } else {
                    toast.error(response.data.message);
                  }
                } catch (error) {
                  toast.error('Failed to add user.');
                }
              }}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

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
                  toast.error("Please enter a group name.");
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
                      initials: response.data.group.initials || response.data.group.name.substring(0, 2).toUpperCase(),
                      avatar: 'https://example.com/default-group-avatar.jpg',
                    };
                    setGroups([...groups, newGroup]);
                    setNewGroupId(response.data.group._id);
                    setShowAddMembersModal(true);
                    setShowAddGroupModal(false);
                    setGroupNameInput('');
                  }
                } catch (error) {
                  toast.error("Failed to create group.");
                }
              }}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
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