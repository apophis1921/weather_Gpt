"use client";
import React, { useState, useEffect } from 'react';
import { Mic, CloudRain, Wind, AlertTriangle, Radio, Wifi, Send, Menu, Loader2 } from 'lucide-react';

export default function WeatherGPTMobileUI() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // --- Live Device States ---
  const [currentTime, setCurrentTime] = useState("00:00");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 }); // Defaults to Pune
  const [isRecording, setIsRecording] = useState(false);

  // --- Chat States ---
  const [aiResponse, setAiResponse] = useState(
    "Tap the button below or ask a question to get real-time AI weather & farming advisories."
  );
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. Real-Time Clock ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. Live Battery Status ---
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // --- 3. Live GPS Location ---
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // --- 4. Live Voice Recognition (Speech-to-Text) ---
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSendMessage(transcript); // Automatically send the message after talking
    };

    recognition.onerror = (event: any) => console.error("Speech Error:", event.error);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // --- Live API Call ---
  const handleSendMessage = async (textQuery?: string) => {
    const messageToSend = textQuery || query;
    if (!messageToSend) return;

    setIsLoading(true);
    try {
      const res = await fetch("https://weather-gpt-mxit.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_query: messageToSend,
          latitude: coords.lat, // Now uses dynamic GPS
          longitude: coords.lng, // Now uses dynamic GPS
          language: "en"
        }),
      });

      const data = await res.json();
      if (data.response) {
        setAiResponse(data.response);
      } else {
        setAiResponse("No response received from model.");
      }
    } catch (err) {
      console.error("API Call Failed:", err);
      setAiResponse("Error connecting to server. Please verify the backend is active.");
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white h-[850px] rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
        
        {/* Dynamic Status Bar */}
        <div className={`px-6 py-3 flex justify-between text-xs font-bold text-white transition-colors duration-500 ${isOfflineMode ? 'bg-red-600' : 'bg-blue-600'}`}>
          <span>{currentTime}</span>
          <div className="flex gap-2 items-center">
            {isOfflineMode ? <Radio size={14} className="animate-pulse" /> : <Wifi size={14} />}
            <span>{isOfflineMode ? "BLE MESH ACTIVE" : "5G ONLINE"}</span>
            <span>🔋 {batteryLevel}%</span>
          </div>
        </div>

        {/* Network Toggle */}
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
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5 flex flex-col">
          
          {!isOfflineMode && activeTab === 'home' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="text-center mt-2">
                <h2 className="text-xl font-bold text-gray-800">
                  📍 {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
                </h2>
                <div className="text-5xl font-black text-blue-600 mt-2">28°C</div>
                <div className="flex justify-center gap-4 mt-2 text-gray-600 text-sm">
                  <span className="flex items-center"><CloudRain size={16} className="mr-1"/> 12% Rain</span>
                  <span className="flex items-center"><Wind size={16} className="mr-1"/> 14 km/h</span>
                </div>
              </div>

              {/* Chatbot/AI Live Response Card */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-start">
                <p className="text-xs font-semibold text-green-600 mb-1">🤖 WeatherGPT AI Advisory</p>
                <div className="text-gray-700 text-sm leading-relaxed overflow-y-auto max-h-[200px]">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                      Analyzing weather forecasts...
                    </div>
                  ) : (
                    aiResponse
                  )}
                </div>
              </div>

              {/* Input Box */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ask about crops or rainfall..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                  className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Working Voice Mic Button */}
              <div className="flex flex-col items-center mt-2">
                <button 
                  onClick={handleVoiceInput}
                  disabled={isLoading || isRecording}
                  className={`${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} p-5 rounded-full shadow-lg hover:scale-105 transition-transform`}
                >
                  <Mic size={28} color="white" />
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2 font-medium">
                  {isRecording ? "Listening... Speak now!" : "Tap mic to speak"}
                </p>
              </div>
            </div>
          )}

          {/* OFFLINE DISASTER MODE TAB */}
          {isOfflineMode && (
            <div className="space-y-4">
              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r-lg animate-pulse">
                <div className="flex items-center text-red-800 font-bold mb-1">
                  <AlertTriangle size={18} className="mr-2" />
                  CRITICAL ALERT (BLE Mesh)
                </div>
                <p className="text-sm text-red-700">
                  Cyclone Warning. Internet offline. Relayed via decentralized Bluetooth mesh network.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 text-sm mb-2">EARA Node Diagnostics</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>🟢 Relay Status: Active</li>
                  <li>{batteryLevel > 20 ? '🟢' : '🔴'} Current Battery: {batteryLevel}%</li>
                  <li>🟢 Emergency Notification: Dispatched</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 flex justify-around p-3">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
            <CloudRain size={20} />
            <span className="text-[10px] font-bold mt-1">Weather</span>
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`flex flex-col items-center ${activeTab === 'alerts' ? 'text-red-600' : 'text-gray-400'}`}>
            <AlertTriangle size={20} />
            <span className="text-[10px] font-bold mt-1">Alerts</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Menu size={20} />
            <span className="text-[10px] font-bold mt-1">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}