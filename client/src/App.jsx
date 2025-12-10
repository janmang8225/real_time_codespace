import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import { v4 as uuidv4 } from 'uuid';

const getRandomColor = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080', '#00ffff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

function App() {
  const [roomId, setRoomId] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const [color] = useState(getRandomColor());

  const createRoom = async () => {
    // In a real app we might ask server for ID, but generating one is fine for this demo
    // or we fetch from POST /rooms
    try {
      const response = await fetch('https://real-time-codespace.onrender.com/rooms', { method: 'POST' });
      const data = await response.json();
      setRoomId(data.id);
      setIsInRoom(true);
      setIsHost(true);
    } catch (e) {
      console.error("Server not reachable, using local uuid");
      const id = uuidv4();
      setRoomId(id);
      setIsInRoom(true);
      setIsHost(true);
    }
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const id = e.target.roomInput.value;
    if (id) {
      setRoomId(id);
      setIsInRoom(true);
      setIsHost(false);
    }
  };

  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Collaborative Editor
        </h1>
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="space-y-6">
            <button
              onClick={createRoom}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Create New Room
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or join existing</span>
              </div>
            </div>
            <form onSubmit={joinRoom} className="space-y-4">
              <input
                name="roomInput"
                type="text"
                placeholder="Enter Room ID"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-100">Room: {roomId}</h1>
          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
            You: <span style={{ color }}>{username}</span> {isHost && <span className="bg-yellow-600 text-white px-1 rounded ml-1">Host</span>}
          </span>
        </div>
        <button
          onClick={() => setIsInRoom(false)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Leave
        </button>
      </header>
      <main className="flex-1 overflow-hidden relative">
        <Editor
          roomId={roomId}
          username={username}
          color={color}
        />
      </main>
    </div>
  );
}

export default App;
