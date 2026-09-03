"use client";
import React, { useState } from 'react';
import { Mic, CloudRain, Wind, AlertTriangle, Radio, Wifi, Send, Menu } from 'lucide-react';

export default function WeatherGPTMobileUI() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleSendMessage = async (query: string) => {
  try {
    const res = await fetch("https://YOUR-RENDER-APP-NAME.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_query: query,
        latitude: 18.5204, // e.g. Pune coordinates
        longitude: 73.8567,
        language: "en"
      }),
    });
    const data = await res.json();
    console.log("AI Response:", data.response);
  } catch (err) {
    console.error("API Call Failed:", err);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {/* Mobile Device Container */}
      <div className="w-full max-w-md bg-white h-[850px] rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
        
        {/* Status Bar */}
        <div className={`px-6 py-3 flex justify-between text-xs font-bold text-white transition-colors duration-500 ${isOfflineMode ? 'bg-red-600' : 'bg-blue-600'}`}>
          <span>9:41</span>
          <div className="flex gap-2 items-center">
            {isOfflineMode ? <Radio size={14} className="animate-pulse" /> : <Wifi size={14} />}
            <span>{isOfflineMode ? "BLE MESH ACTIVE" : "5G ONLINE"}</span>
            <span>🔋 42%</span>
          </div>
        </div>

        {/* Network Toggle (For Demo Purposes) */}
        <div className="bg-gray-100 p-2 flex justify-center text-xs">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 font-semibold">Simulate Disaster (Mesh Mode)</span>
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isOfflineMode}
              onChange={() => setIsOfflineMode(!isOfflineMode)}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
          
          {/* HOME TAB - Normal Weather Mode */}
          {!isOfflineMode && activeTab === 'home' && (
            <div className="space-y-6">
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-gray-800">Pune, Maharashtra</h2>
                <p className="text-gray-500">Currently</p>
                <div className="text-6xl font-black text-blue-600 mt-2">28°C</div>
                <div className="flex justify-center gap-4 mt-4 text-gray-600">
                  <span className="flex items-center"><CloudRain size={18} className="mr-1"/> 12%</span>
                  <span className="flex items-center"><Wind size={18} className="mr-1"/> 14 km/h</span>
                </div>
              </div>

              {/* Chatbot/AI Response Area */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-8">
                <p className="text-sm font-semibold text-green-600 mb-2">🤖 WeatherGPT Agri-Advisory (Hindi to English)</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "Based on GFS models, heavy rainfall (45mm) is expected tomorrow. It is strictly advised to pause wheat harvesting to prevent fungal grain rot."
                </p>
              </div>

              {/* Voice Button */}
              <div className="flex justify-center mt-12">
                <button className="bg-blue-600 p-6 rounded-full shadow-lg shadow-blue-200 animate-bounce">
                  <Mic size={32} color="white" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Tap to speak in 22 languages</p>
            </div>
          )}

          {/* OFFLINE DISASTER MODE TAB */}
          {isOfflineMode && (
            <div className="space-y-4">
              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r-lg animate-pulse">
                <div className="flex items-center text-red-800 font-bold mb-1">
                  <AlertTriangle size={18} className="mr-2" />
                  CRITICAL ALERT (via BLE Mesh)
                </div>
                <p className="text-sm text-red-700">
                  Cyclone Warning. Internet is down. This message was relayed via Bluetooth from a device 400m away.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 text-sm mb-2">Network Diagnostics</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>🟢 Received from: Node_A9F2</li>
                  <li>🟡 Your Battery: 42% (Courier Mode)</li>
                  <li>🟢 Re-broadcasting packet: SUCCESS</li>
                </ul>
              </div>

              <button className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex justify-center items-center">
                <Send size={18} className="mr-2" /> SEND EMERGENCY SOS
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">Will transmit instantly via mesh or store-and-forward SMS.</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 flex justify-around p-4 pb-6">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
            <CloudRain size={24} />
            <span className="text-[10px] font-bold mt-1">Weather</span>
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`flex flex-col items-center ${activeTab === 'alerts' ? 'text-red-600' : 'text-gray-400'}`}>
            <AlertTriangle size={24} />
            <span className="text-[10px] font-bold mt-1">Alerts</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Menu size={24} />
            <span className="text-[10px] font-bold mt-1">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}