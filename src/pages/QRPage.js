import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSessionStore from '../store/useStore';
import {QRCodeSVG} from 'qrcode.react';

export default function QRPage() {
  const { sessionId, setWs, setFiles } = useSessionStore();
  const location = useLocation();
  const navigate = useNavigate();

  
  const ip = process.env.REACT_APP_LOCAL_IP ;
  const port = process.env.REACT_APP_PORT;
  

  useEffect(() => {
  if (!sessionId) {
    navigate('/');
  }
  console.log(ip+":"+port)
}, []);


  useEffect(() => {
    const handlePopState = (e) => {
      if (sessionId) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };
  
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sessionId]);

  useEffect(() => {
    // if (sessionId) {
    //   navigate('/home');
    //   console.log(sessionId);
    //   return;
    // }
    const ws = new WebSocket(`ws://${ip}:${port}`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'init', sessionId}));
      console.log('[WS] New connection for sessionId:', sessionId);
    };
    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
      const msg = JSON.parse(event.data);
      console.log('Parsed message:', msg.type);
    
      switch (msg.type) {
        // case 'ready':
        //   ws.send(JSON.stringify({ type: 'list', sessionId }));
        //   break;

          case 'client-connected':
            console.log('Client connected from Flutter app');
            navigate('/home', { state: { connected: true }, replace: true });

            break;

          
          case 'list':
            setFiles(msg.files);
            console.log('Files received:', msg.files);
          break;
    
        case 'expired':
          // alert('Session expired');
          navigate('/');
          break;
    
        case 'client-disconnected':
          console.log('Client disconnected from server');
          break;
    
        default:
          console.log('Unhandled message type:', msg.type);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
    
    setWs(ws);
  }, [sessionId]);

  const qrData = location.state?.qrData;

  return (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="bg-[#111] text-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold text-[#7ed1d7]">Scan this QR Code</h1>
        {qrData ? (
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={qrData} size={200} />
          </div>
        ) : (
          <p className="text-gray-400">No QR code available</p>
        )}
        <h1 className="text-1xl font-bold text-center text-[#7ed1d7]">CODE : {sessionId}</h1>
      </div>
    </div>
  );
}
