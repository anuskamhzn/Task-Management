import React from 'react';
import PrivateChat from '../Message/PrivateChat';
import GroupChat from '../Message/GroupChat';

const ChatList = ({
  users,
  groups,
  currentChat,
  chatType,
  handleChatClick,
  setMessages,
  socket,
  token,
  currentUser,
  setShowAddUserModal,
  setShowAddGroupModal,
}) => {
  return (
    <aside className="w-64 bg-gray-200 text-gray-900 p-4 shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => { handleChatClick(null, null); setMessages([]); }}
          title="Reset to initial state"
        >
          Chats
        </h2>
        <div className="flex space-x-2">
          <button
            className="text-white bg-blue-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => setShowAddUserModal(true)}
            title="Add User"
          >
            +U
          </button>
          <button
            className="text-white bg-green-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
            onClick={() => setShowAddGroupModal(true)}
            title="Add Group"
          >
            +G
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No users available</p>
        ) : (
          <PrivateChat
            users={users}
            currentChat={currentChat}
            chatType={chatType}
            handleChatClick={handleChatClick}
            setMessages={setMessages}
            socket={socket}
            token={token}
            currentUser={currentUser}
          />
        )}
        <hr className="border-gray-300 my-4" />
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500">No groups available</p>
        ) : (
          <GroupChat
            groups={groups}
            currentChat={currentChat}
            chatType={chatType}
            handleChatClick={handleChatClick}
            setMessages={setMessages}
            socket={socket}
            token={token}
            currentUser={currentUser}
          />
        )}
      </div>
    </aside>
  );
};

export default ChatList;