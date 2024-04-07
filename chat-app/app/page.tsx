"use client"; // This is a client component 👈🏽
import "./globals.css";

import { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';

interface MessageContent {
  msg: string;
  userId: string | null;
}

type PageProps = {
  children: ReactNode;
};

export default function Page({ children }: PageProps) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    var full_name = localStorage.getItem('full_name');
  
    function messageAppend(myMessage: boolean, msgContent: MessageContent) {
      let sideOff = 'justify-start',
          bgColor = 'bg-slate-700',
          textColor = 'text-slate-100';
    
      if (myMessage) {
        sideOff = 'justify-end';
        bgColor = 'bg-indigo-500';
      }
    
      const specificUser = msgContent.userId || 'Anonymous';
    
      const msgString = `
      <div class="${myMessage ? 'message-outgoing' : 'message-incoming'}">
        <p class="message-content">${msgContent.msg}</p>
        <p class="message-meta">${specificUser} ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
    
      const msgEl = document.createRange().createContextualFragment(msgString);
      document.getElementById('message-box')?.appendChild(msgEl);
    }    

    function connectWebSocket() {
      if (full_name && (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED)) {
        console.log("connect to websocket");
        socketRef.current = new WebSocket(`ws://localhost:8000/ws/${full_name}`);

        socketRef.current.addEventListener('open', () => {
          console.log("Connection is open");
        });

        socketRef.current.addEventListener('close', () => {
          console.log("Connection is closed");
          setTimeout(connectWebSocket, 1000); // Attempt to reconnect after 1 second
        });

        socketRef.current.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.userId !== full_name) {
            messageAppend(false, data);
          }
        });
      }
    }
  
    connectWebSocket(); // Initial connection
  
    const form = document.getElementById('message-form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const messageEl = document.getElementById('message') as HTMLInputElement;
      if (messageEl.value && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(messageEl.value);
        messageAppend(true, { "msg": messageEl.value, "userId": full_name});
        messageEl.value = '';
      }
    });
  
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="chat-title">Chat App</h1>
        <div className="w-full max-w-xl">
          <div className="message-box" id="message-box">
            {/* Messages will be displayed here */}
          </div>
          <form id="message-form" className="message-form">
            <input type="text" id="message" className="message-input" placeholder="Enter your message" />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
