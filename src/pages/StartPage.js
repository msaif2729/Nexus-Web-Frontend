import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSessionStore from '../store/useStore';

export default function StartPage() {
  const [input, setInput] = useState('10');
  const { setDuration, setSessionId, sessionId, ws } = useSessionStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const savedSession = getCookie('sessionId');

    if (ws && sessionId) {
      navigate('/home', { state: { connected: true }, replace: true });
    } else if (savedSession) {
      setSessionId(savedSession);
      navigate('/home', { replace: true });
    }
  }, []);

  const handleStart = async () => {
    const duration = parseInt(input);
    setDuration(duration);

    const res = await fetch('http://192.168.0.105:5000/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration })
    });

    const data = await res.json();
    setSessionId(data.sessionId);

    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + duration);
    document.cookie = `sessionId=${data.sessionId}; expires=${expireTime.toUTCString()}; path=/`;

    navigate('/qr', { state: { qrData: data.qrData }, replace: true });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    // allow empty string for clearing input temporarily
    if (value === '' || parseInt(value) >= 10) {
      setInput(value);
    }
  };

  return (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="bg-[#111] text-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 items-center">
        <h1 className="text-3xl font-bold text-[#7ed1d7]">Start a Session</h1>
        <input
          type="number"
          value={input}
          min="10"
          onChange={handleChange}
          placeholder="Duration in minutes"
          className="w-full p-3 rounded-lg text-black outline-none focus:ring-2 focus:ring-[#7ed1d7]"
        />
        <button
          onClick={handleStart}
          disabled={input === '' || parseInt(input) < 10}
          className="w-full bg-[#7ed1d7] text-black font-semibold py-3 rounded-lg transition-opacity disabled:opacity-50 hover:opacity-90"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}
