import React from 'react';
import PrivateChat from '../MesTest/PrivateChat';
import GroupChat from '../MesTest/GroupChat';

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
  recentSenders, // Receive recentSenders prop
}) => {
  return (
    <aside className="w-64 text-gray-900 p-4 shrink-0 border-r border-gray-300">
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
      <div
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
        style={{ maxHeight: 'calc(100vh - 150px)' }}
      >
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No users available</p>
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
              recentSenders={recentSenders} // Pass recentSenders to PrivateChat
            />
          )}
          <hr className="border-gray-300 my-4" />
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No groups available</p>
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
      </div>
    </aside>
  );
};

export default ChatList;