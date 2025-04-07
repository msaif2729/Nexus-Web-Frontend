import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSessionStore from '../store/useStore';

export default function HomePage() {
  const { files, setFiles, ws, sessionId, reset,setWs } = useSessionStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (!ws) {
      const socket = new WebSocket('ws://192.168.0.105:5000');

      socket.onopen = () => {
        // console.log('WebSocket connected');
        setWs(socket);
        
        socket.send(JSON.stringify({ type: 'list' }));
      };
      

      socket.onclose = () => {
        console.log('WebSocket closed');
      };
      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    }
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
    if (!ws) return;

    

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'list') {
        setFiles(data.files);
      }

      if (data.type === 'file') {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${data.content}`;
        link.download = data.name;
        link.click();
      }
    };
  }, [ws]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      ws.send(JSON.stringify({
        type: 'upload',
        name: selectedFile.name,
        content: base64,
      }));
      ws.send(JSON.stringify({ type: 'list' }));
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = (file) => {
    ws.send(JSON.stringify({
      type: 'download',
      file,
    }));
  };

  const confirmLogout = async () => {
    await fetch('http://192.168.0.105:5000/delete-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sessionId })
    });

    document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    ws.close();
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-[#7ed1d7]">Resource Sharing Host</h1>

        <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#7ed1d7] mb-3">Upload File</h2>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="mb-3 bg-[#1a1a1a] text-white p-2 rounded border border-gray-500 w-full"
          />
          <button
            onClick={handleUpload}
            className="bg-[#7ed1d7] hover:bg-[#5bcdd2] text-black font-semibold px-4 py-2 rounded w-full"
          >
            Upload
          </button>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#7ed1d7] mb-4">Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-400">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-3">
              {files.map((file, i) => (
                <li
                  key={i}
                  className="bg-[#1f1f1f] text-white flex items-center justify-between px-4 py-2 rounded-lg"
                >
                  <span className="truncate">{file}</span>
                  <button
                    onClick={() => handleDownload(file)}
                    className="bg-[#7ed1d7] hover:bg-[#5bcdd2] text-black px-3 py-1 rounded text-sm font-medium"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#2a2a2a] text-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
