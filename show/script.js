
const cookieName = 'damn';
const cookieValue = getCookieValue(cookieName);
function openChat(contactName) {
  document.getElementById('contact-name').innerText = contactName;
  // You can load previous chat history here if you have it stored.
}
const socket = io();
var recipient,indx;
function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  if (message !== '') {
    appendMessage(cookieValue, message);
    messageInput.value = '';
    
   
    // recipient=cookieValue;

  socket.emit('privateMessage', { recipient, message });
    
  }
}

function appendMessage(sender, text,val="0") {
  let chatMessages;
  
  // const chatMessages = document.getElementById(`chat${recipient}`);
  if(val==0){ chatMessages = document.getElementById(`chat${recipient}`);}
  else{
    chatMessages = document.getElementById(`chat${val}`);
  }
  const messageDiv = document.createElement('div');
  const messageSender = document.createElement('span');
  const messageText = document.createElement('span');

  messageDiv.classList.add('chat-message');

  // messageSender.classList.add('message-sender');
  // messageSender.textContent = sender + ': ';

  messageText.classList.add('message-text');
  messageText.textContent = text;

  // Determine if the message was sent by the user
  const sentByUser = sender === cookieValue;

  // Add the appropriate class for message alignment
  if (sentByUser) {
    messageDiv.classList.add('sent');
  } else {
    messageDiv.classList.add('received');
  }

  // messageDiv.appendChild(messageSender);
  messageDiv.appendChild(messageText);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}




function getCookieValue(cookieName) {
  const cookies = document.cookie.split(';'); // Split all cookies into an array
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Check if the cookie starts with the desired name followed by an equals sign (=)
    if (cookie.indexOf(cookieName + '=') === 0) {
      // Return the value of the cookie (everything after the equals sign)
      return cookie.substring(cookieName.length + 1);
    }
  }
  // Return null if the cookie with the given name was not found
  return null;
}


document.getElementById("nam").textContent=cookieValue;
socket.on('privateMessage', (data) => {
  console.log("i am workiing");
  const { sender, message } = data;
 appendMessage(sender,message,sender);
});
socket.emit('setUsername', cookieValue);




async function setallcontact(){


  const response = await fetch(`/chats/${cookieValue}`);
  const data = await response.json();
  let name=Object.keys(data)
let count=1;
name.forEach(element => {
  document.getElementById('allcontact').innerHTML+=`<div class="contact" onclick="switchChat(${count},'${element}')">
<img src="john_doe_picture.jpg" alt="John Doe">
<div class="contact-info">
  <h4>${element}</h4>
  <span>Last seen: 5 minutes ago</span>
</div>
</div>`







var additionalDiv = document.createElement('div');
  additionalDiv.classList.add('chat-messages');
  additionalDiv.id="chat"+element;

  // Add content to the new div
  

  const umessages = data[element]; 
  umessages.forEach((message) => {





    const messageDiv = document.createElement('div');
    const messageSender = document.createElement('span');
    const messageText = document.createElement('span');
  
    messageDiv.classList.add('chat-message');
  
    // messageSender.classList.add('message-sender');
    // messageSender.textContent = sender + ': ';
  
    messageText.classList.add('message-text');
    messageText.textContent = message.message;
  
    // Determine if the message was sent by the user
    const sentByUser = message.sendby === cookieValue;
  
    // Add the appropriate class for message alignment
    if (sentByUser) {
      messageDiv.classList.add('sent');
    } else {
      messageDiv.classList.add('received');
    }
  
    // messageDiv.appendChild(messageSender);
    messageDiv.appendChild(messageText);
  
    additionalDiv.appendChild(messageDiv);
    additionalDiv.scrollTop = additionalDiv.scrollHeight;
  


  });






  // Append the new div to the chat container
  const chatContainer = document.querySelector('.chat-container');
  chatContainer.insertBefore(additionalDiv, chatContainer.querySelector('.message-input'));

count++;

  

  

});



}
setallcontact()
function switchChat(index,reci) {
  recipient=reci;
  indx=index;
  openChat(reci);
  // Hide all chat divs
  const chats = document.querySelectorAll('.chat-messages');
  chats.forEach((chat) => {
    chat.style.display = 'none';
  });

  // Show the selected chat div
  const selectedChat = document.getElementById(`chat${reci}`);
  if (selectedChat) {
    selectedChat.style.display = 'block';
  }

  selectedChat.scrollTop = selectedChat.scrollHeight;

}

