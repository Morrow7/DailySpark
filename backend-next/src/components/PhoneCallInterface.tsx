'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, Volume2, VolumeX, X } from 'lucide-react';
import { usePhoneCall, CallStatus } from '@/hooks/usePhoneCall';

interface PhoneCallInterfaceProps {
  onClose: () => void;
  userName?: string;
  avatar?: string;
}

export default function PhoneCallInterface({ onClose, userName = "Doubao AI", avatar }: PhoneCallInterfaceProps) {
  const { 
    status, 
    duration, 
    isMuted, 
    isSpeakerOn, 
    setIsMuted, 
    setIsSpeakerOn, 
    startCall, 
    endCall,
    getAudioData 
  } = usePhoneCall();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Auto start call when mounted
  useEffect(() => {
    startCall();
    return () => {
      endCall(); // Ensure cleanup if unmounted abruptly
    };
  }, []);

  // Close when idle (after ended)
  useEffect(() => {
    if (status === 'idle' && duration === 0) {
      // Small delay to show "Ended" state
      const t = setTimeout(onClose, 500);
      return () => clearTimeout(t);
    }
  }, [status, duration, onClose]);

  // Audio Visualization Loop
  useEffect(() => {
    if (status !== 'connected') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const data = getAudioData();
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Wave color
      
      const barWidth = (width / data.length) * 2.5;
      let x = 0;

      for(let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * height * 0.8;
        
        // Mirrored effect
        ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status, getAudioData]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-between text-white py-12 animate-fade-in overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600 blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 blur-[100px]" />
      </div>

      {/* Top: Status & Timer */}
      <div className="z-10 flex flex-col items-center mt-8">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-blue-500 mb-6 shadow-2xl shadow-pink-500/20">
           <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden relative">
             {avatar ? (
               <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-4xl">🤖</div>
             )}
           </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{userName}</h2>
        <p className="text-gray-400 font-medium tracking-wide">
          {status === 'dialing' ? 'Calling...' : 
           status === 'connected' ? formatTime(duration) : 
           status === 'ended' ? 'Call Ended' : 'Connecting...'}
        </p>
      </div>

      {/* Middle: Audio Visualizer */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10">
        {status === 'connected' ? (
           <canvas ref={canvasRef} width={300} height={100} className="max-w-full" />
        ) : (
           <div className="animate-pulse flex gap-2">
             <div className="w-2 h-2 bg-white rounded-full" />
             <div className="w-2 h-2 bg-white rounded-full animation-delay-200" />
             <div className="w-2 h-2 bg-white rounded-full animation-delay-400" />
           </div>
        )}
      </div>

      {/* Bottom: Controls */}
      <div className="z-10 w-full max-w-md px-8 mb-8">
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5">
          {/* Mute */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all duration-300 flex flex-col items-center gap-2 ${isMuted ? 'bg-white text-gray-900' : 'bg-transparent text-white hover:bg-white/10'}`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">Mute</span>
          </button>

          {/* End Call */}
          <button 
            onClick={endCall}
            className="p-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 transform hover:scale-110 transition-all duration-300"
          >
            <Phone size={36} className="rotate-[135deg]" />
          </button>

          {/* Speaker */}
          <button 
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-all duration-300 flex flex-col items-center gap-2 ${isSpeakerOn ? 'bg-white text-gray-900' : 'bg-transparent text-white hover:bg-white/10'}`}
          >
            {isSpeakerOn ? <Volume2 size={28} /> : <VolumeX size={28} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">Speaker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
