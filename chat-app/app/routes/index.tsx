// app/routes/index.tsx

import { useEffect } from 'react';

interface MessageContent {
  msg: string;
  userId: string | null;
}

export default function Home() {
  useEffect(() => {
    const userId: string = window.crypto.randomUUID();
    const socket = new WebSocket(`ws://localhost:8000/ws/${userId}`);

    function messageAppend(myMessage: boolean, msgContent: MessageContent) {
      let sideOff = 'justify-start',
          bgColor = 'bg-slate-700',
          specificUser = userId;

      if (myMessage) {
        sideOff = 'justify-end';
        bgColor = 'bg-indigo-500';
      } else {
        specificUser = msgContent.userId || 'Anonymous';
      }

      const msgString = `
        <div class="w-full flex ${sideOff}">
          <div class="box-bordered p-1 ${bgColor} w-8/12 text-slate-100 rounded mb-1">
            <p>${msgContent.msg}</p>
            <p>${specificUser}</p>
          </div>
        </div>
      `;

      const msgEl = document.createRange().createContextualFragment(msgString);
      document.getElementById('message-box')?.appendChild(msgEl);
    }

    socket.addEventListener('open', () => {
      console.log("Connection is open");
    });

    socket.addEventListener('close', () => {
      console.log("Connection is closed");
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      messageAppend(false, data);
    });

    const form = document.getElementById('message-form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const messageEl = document.getElementById('message') as HTMLInputElement;
      if (messageEl.value) {
        socket.send(messageEl.value);
        messageAppend(true, { msg: messageEl.value, userId: null });
        messageEl.value = '';
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl text-gray-800 font-bold mb-4">Chat App</h1>
        <div className="message-box w-full h-96 overflow-y-auto bg-gray-200 rounded-lg shadow-md p-4 mb-8" id="message-box">
        </div>
        <form id="message-form" className="flex items-center mb-4">
            <input type="text" id="message" className="border border-gray-300 rounded-l-lg py-2 px-4 w-full focus:outline-none focus:ring focus:border-blue-300" placeholder="Enter your message" />
            <button type="submit" className="bg-blue-500 text-white rounded-r-lg px-6 py-2 ml-2 hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300">Send</button>
        </form>
    </div>
    </>
  );
}
