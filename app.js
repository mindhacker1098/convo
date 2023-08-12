const express = require('express');
require('dotenv').config();
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const server = http.createServer(app);
const io = socketIO(server);
// Serve the client-side files (HTML, CSS, JS)
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/damn',express.static(__dirname + '/public'));
app.use('/chatinterface',express.static(__dirname + '/show'));
// app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));
app.set('view engine', 'ejs');
// Keep track of connected users and their corresponding socket IDs
const connectedUsers = {};
mongoose.connect(process.env.m_url);
// Define the user schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const chatSchema=new mongoose.Schema({
  user:{type:String,required:true},
  receiver:{type:String,required:true},
  chat:{type:String},
  sendby:{type:String},
  cdate:{type:Date,default:Date.now}
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat',chatSchema);
io.on('connection', (socket) => {

  console.log('A user connected.');

 // Handle incoming messages
socket.on('message', (data) => {

    console.log('Received message:', data);
    io.emit('message', data); // Broadcast the message to all connected clients, including the sender
    
  });

  // Handle private messages
  socket.on('privateMessage', async (data) => {
    const { recipient, message } = data;
    const sender = connectedUsers[socket.id];
    const recipientSocket = Object.keys(connectedUsers).find(
      (socketId) => connectedUsers[socketId] === recipient
    );

    if (recipientSocket) {
      io.to(recipientSocket).emit('privateMessage', {
        sender,
        message,
      });

      await Chat.create({ user:sender, receiver:recipient,chat:message,sendby:sender});

      await Chat.create({ user:recipient, receiver:sender,chat:message,sendby:sender});






    }
  });

  // Handle user identification
  socket.on('setUsername', (username) => {
    connectedUsers[socket.id] = username;
    console.log(`${username} has connected.`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const disconnectedUser = connectedUsers[socket.id];
    if (disconnectedUser) {
      console.log(`${disconnectedUser} has disconnected.`);
      delete connectedUsers[socket.id];
    }
  });

});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/chats/:name',async(req,res)=>{

// let allusers=await Chat.distinct('receiver',{user:'damnducky'},{sort:{cdate:-1}});
// const distinctReceivers = await Chat.aggregate([
//   { $match: { user: 'damnducky' } },
//   { $sort: { cdate: -1 } }, // Sort by cdate in descending order
//   { $group: { _id: "$receiver", lastChatDate: { $first: "$cdate" } } },
//   { $sort: { lastChatDate: -1 } } // Sort by lastChatDate in descending order
// ]);

// const receivers = distinctReceivers.map((entry) => entry._id);

const allChats = await Chat.find({ user: req.params.name }).sort({ cdate: -1 });

    // Create an object to store the chat data
    const chatData = {};

    // Iterate through the chats and organize them by receiver
    allChats.forEach(chat => {
      const { receiver, chat: message, sendby, cdate } = chat;
      
      // Create a new receiver entry if not present in the chatData object
      if (!chatData[receiver]) {
        chatData[receiver] = [];
      }

      // Add the chat message to the receiver's array
      chatData[receiver].push({ message, sendby, cdate });
    });

    // Reverse the order of chat messages for each receiver
    for (const receiver in chatData) {
      chatData[receiver].reverse();
    }




// console.log(receivers);







res.send(chatData);
})
app.post('/register', async (req, res) => {
  var { username, password } = req.body;
  var hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({ username, password: hashedPassword });
    console.log('User registered:', newUser);
    res.redirect('/');
  } catch (err) {
    console.error('Error registering user:', err);
    res.redirect('/register');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('User logged in:', user);
      res.setHeader('Set-Cookie',`damn=${username}`);
      res.redirect('/chatinterface')
    } else {
      console.log('Invalid username or password.');
      res.send('Invalid username or password.');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.send('Error logging in.');
  }
});
// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  
  console.log(`Server running on http://localhost:${PORT}`);

  

});
