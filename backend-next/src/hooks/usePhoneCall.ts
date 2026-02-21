import { useState, useEffect, useRef, useCallback } from 'react';

export type CallStatus = 'idle' | 'dialing' | 'connected' | 'ended';

export interface CallState {
  status: CallStatus;
  duration: number; // seconds
  isMuted: boolean;
  isSpeakerOn: boolean;
}

export function usePhoneCall() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // In Web, this might just route to default output
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Start Call
  const startCall = useCallback(async () => {
    setStatus('dialing');
    setDuration(0);
    
    try {
      // Request Mic Permission immediately
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Init Audio Context for visualization
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }

      // Simulate connection delay
      setTimeout(() => {
        setStatus('connected');
      }, 1500);

    } catch (err) {
      console.error("Failed to get microphone:", err);
      alert("Microphone permission denied. Cannot start call.");
      setStatus('ended');
      setTimeout(() => setStatus('idle'), 1000);
    }
  }, []);

  // End Call
  const endCall = useCallback(() => {
    setStatus('ended');
    
    // Cleanup Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Cleanup Audio Context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Save call record (Mock)
    if (duration > 0) {
       const record = {
         date: new Date().toISOString(),
         duration,
         type: 'outgoing'
       };
       const history = JSON.parse(localStorage.getItem('call_history') || '[]');
       localStorage.setItem('call_history', JSON.stringify([record, ...history]));
    }

    setTimeout(() => {
      setStatus('idle');
      setDuration(0);
    }, 1000);
  }, [duration]);

  // Timer Logic
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Audio Data for Visualizer
  const getAudioData = useCallback(() => {
    if (!analyserRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  return {
    status,
    duration,
    isMuted,
    isSpeakerOn,
    setIsMuted,
    setIsSpeakerOn,
    startCall,
    endCall,
    getAudioData
  };
}
