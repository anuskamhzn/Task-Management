const io = require('socket.io-client');

const tokenAnuska = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGM3ZmQxZTJiMjlhMmExMzQ5NWNlYSIsImVtYWlsIjoiYW51c2thbWh6bjMzQGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzQxMTQ0NDkxLCJleHAiOjE3NDEyMzA4OTF9.XIX9w3ZJlNDdJN0l83ncnA-Bl_Fv_c58g81hpQcYcPI';
const tokenRam = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjE1N2ZmODgzMGZhMzA0NDk5MTI5ZCIsImVtYWlsIjoicmFtQGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzQxMTQ0NTE0LCJleHAiOjE3NDEyMzA5MTR9.jC_NKFNQpcqz3nJ9n95LvZfCfc6Ba3Y5jMRpMby3Mz0';

const anuskaId = '674c7fd1e2b29a2a13495cea';
const ramId = '676157ff8830fa304499129d';

const socketRam = io('http://localhost:5000', { auth: { token: tokenRam } });
socketRam.on('connect', () => {
  console.log(`[${new Date().toISOString()}] Ram connected (socket ID: ${socketRam.id})`);
});
socketRam.on('newMessage', (message) => {
  if (message.sender === ramId) {
    console.log(`[${new Date().toISOString()}] Ram sent: ${message.content} (to ${message.recipient})`);
  } else {
    console.log(`[${new Date().toISOString()}] Ram received: ${message.content} (from ${message.sender})`);
  }
});
socketRam.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Ram error:`, error);
});

const socketAnuska = io('http://localhost:5000', { auth: { token: tokenAnuska } });
socketAnuska.on('connect', () => {
  console.log(`[${new Date().toISOString()}] Anuska connected (socket ID: ${socketAnuska.id})`);
  setTimeout(() => {
    console.log(`[${new Date().toISOString()}] Anuska sending to Ram's user ID: 676157ff8830fa304499129d`);
    socketAnuska.emit('sendPrivateMessage', {
      recipientId: '676157ff8830fa304499129d',
      content: 'Hey Ram, this is a private message!'
    });
  }, 2000);
});
socketAnuska.on('newMessage', (message) => {
  if (message.sender === anuskaId) {
    console.log(`[${new Date().toISOString()}] Anuska sent: ${message.content} (to ${message.recipient})`);
  } else {
    console.log(`[${new Date().toISOString()}] Anuska received: ${message.content} (from ${message.sender})`);
  }
});
socketAnuska.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Anuska error:`, error);
});