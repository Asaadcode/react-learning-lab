import { useState, useRef, useEffect } from 'react'
import { Chatbot } from 'supersimpledev'
import dayjs from 'dayjs'
import './App.css'
import RobotImage from './assets/robot.png'
import UserImage from './assets/profile-user.webp'
import LoadingGif from './assets/loading-spinner.gif'

function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function saveInputText(event) {
    setInputText(event.target.value);
  }

  async function sendMessage() {
    if (isLoading) {
      return;
    }

    if (inputText === '') {
      return;
    }

    setInputText('');

    const newChatMessages = [
      ...chatMessages,
      {
        message: inputText,
        sender: 'user',
        time: dayjs().valueOf(),
        id: crypto.randomUUID()
      }
    ];

    setChatMessages([
      ...newChatMessages,
      {
        message: (
          <img 
            src={LoadingGif} 
            style={{ height: '40px', margin: '-15px' }} 
            alt="loading"
          />
        ),
        sender: 'robot',
        time: dayjs().valueOf(),
        id: crypto.randomUUID()
      }
    ]);

    setIsLoading(true); 

    const response = await Chatbot.getResponseAsync(inputText);

    setIsLoading(false); 

    setChatMessages([
      ...newChatMessages,
      {
        message: response,
        sender: 'robot',
        time: dayjs().valueOf(),
        id: crypto.randomUUID()
      }
    ]);
  }

  function clearChat() {
    setChatMessages([]);
  }

  return (
    <div className='chat-input-container'>
      <input
        placeholder="Send a message to Chatbot"
        size="30"
        onChange={saveInputText}
        value={inputText}
        className='chat-input'
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            sendMessage();
          }
          if (event.key === 'Escape') {
            setInputText('');
          }
        }}
      />
      <button
        onClick={sendMessage}
        className='send-button'
      >Send</button>

      <button
        onClick={clearChat}
        className='clear-button'
        style={{ marginLeft: '8px', padding: '8px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >Clear</button>
    </div>
  );
}

function ChatMessage({ message, sender, time }) {
  return (
    <div className={
      sender === 'user' 
      ? 'chat-message-user' 
      : 'chat-message-robot'
    }>
      {sender === 'robot' && (
        <img src={RobotImage} className='chat-message-profile' alt="robot" />
      )}
      <div className='chat-message-container-inner'>
        <div className='chat-message-text'>
            {message}
        </div>
        {time && (
          <div className="chat-message-time" style={{ fontSize: '10px', color: 'gray', marginTop: '4px', textAlign: sender === 'user' ? 'right' : 'left' }}>
            {dayjs(time).format('h:mma')}
          </div>
        )}
      </div>
      {sender === 'user' && (
        <img src={UserImage} width="50" className='chat-message-profile' alt="user" />
      )}
    </div>
  );
}

function ChatMessages({ chatMessages }) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [chatMessages]); 

  return (
    <div className='chat-messages-container' ref={chatMessagesRef}>
      
      {chatMessages.length === 0 && (
        <p style={{ textAlign: 'center', color: 'rgb(120, 120, 120)' }}>
          Welcome to the chat! What&apos;s on your mind Today?
        </p>
      )}

      {chatMessages.map((chatMessage) => {
        return (
          <ChatMessage
            message={chatMessage.message}
            sender={chatMessage.sender}
            time={chatMessage.time}
            key={chatMessage.id}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  const [chatMessages, setChatMessages] = useState(() => {
    return JSON.parse(localStorage.getItem('messages')) || [];
  });

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    Chatbot.addResponses({
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hey there! What can I do for you?',
      'what is your name?': 'I am a simple custom Chatbot built with React!',
      'what can you do?': 'I can respond to basic messages and answer common questions.',
      'what are your features?': 'I support instant responses, custom greetings, and keyword matching!',
      'how are you?': 'I am doing great, thanks for asking!',
      'help': 'Sure! Ask me basic questions like "what is your name" or "what can you do".',
      'who created you?': 'I was created as part of a React learning exercise!',
      'thank you': 'You are welcome! Let me know if you need anything else.',
      'bye': 'Goodbye! Have a great day ahead.'
    });
  }, []);

  return (
    <div className='app-container'>
      <ChatMessages
        chatMessages={chatMessages}
      />
      <ChatInput
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
      />
    </div>
  );
}