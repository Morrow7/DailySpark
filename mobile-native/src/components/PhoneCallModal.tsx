import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { DoubaoService } from '../services/doubaoService';
import { palette, spacing } from '../theme';

const { width, height } = Dimensions.get('window');

interface PhoneCallModalProps {
  visible: boolean;
  onClose: () => void;
  initialMessage?: string;
}

type CallState = 'connecting' | 'listening' | 'processing' | 'speaking' | 'idle';

export default function PhoneCallModal({ visible, onClose, initialMessage, onMessagesGenerated }: PhoneCallModalProps) {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;

  // Audio refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationHistory = useRef<{ role: string, content: string }[]>([]);

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [visible]);

  // Main Flow Control
  useEffect(() => {
    if (visible) {
      startCall();
    } else {
      endCall();
    }
  }, [visible]);

  // Pulse Animation Loop
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (callState === 'listening' || callState === 'speaking') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      setCallState('connecting');
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission missing', 'Microphone access is needed for calls.');
        onClose();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
      });

      // Start conversation
      conversationHistory.current = [
        { role: 'system', content: 'You are Doubao, a helpful and friendly AI assistant. You are in a phone call with the user. Keep your responses concise and conversational, suitable for voice interaction.' }
      ];

      setCallState('idle');
      
      // Initial greeting
      if (initialMessage) {
        await speak(initialMessage);
      } else {
        await speak("Hi there! I'm Doubao. What's on your mind?");
      }

    } catch (error) {
      console.error('Call start error:', error);
      Alert.alert('Error', 'Failed to start call.');
      onClose();
    }
  };

  const endCall = async () => {
    setCallState('idle');
    setDuration(0);
    await stopRecording();
    Speech.stop();
  };

  const startRecording = async () => {
    if (callState === 'processing' || callState === 'speaking') return;

    try {
      await stopRecording(); // Ensure clean slate
      
      console.log('Starting recording...');
      setCallState('listening');

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;

      // Simple VAD simulation: 
      // In a real app, we'd monitor metering levels to detect silence.
      // Here, we'll just set a max duration or let user tap to stop if needed, 
      // but for "Phone" feel, we want auto-stop. 
      // Since auto-stop is hard without VAD, we'll implement a "silence timeout" simulation
      // or just rely on a "Finish" button if the user prefers, BUT
      // to match "Doubao Phone", it usually listens until silence.
      // Let's implement a manual "Tap to Speak" fallback or a fixed timer for demo if VAD is too complex.
      // BETTER: We will use a "Push to Talk" style OR "Tap to toggle" logic on the big button.
      // BUT Doubao is full-duplex.
      // Let's implement: User taps screen to stop listening and send, OR waits 5 seconds of "silence" (mocked).
      
      // For this demo: We will start listening, and the user must tap the Orb to "Send" (Stop & Process).
      // This is a common pattern in AI voice chats to avoid premature cutting.
      
    } catch (error) {
      console.error('Start recording error:', error);
      setCallState('idle');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return null;

    try {
      console.log('Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      return uri;
    } catch (error) {
      console.error('Stop recording error:', error);
      return null;
    }
  };

  const handleUserFinishedSpeaking = async () => {
    if (callState !== 'listening') return;

    const uri = await stopRecording();
    if (uri) {
      processAudio(uri);
    } else {
      setCallState('idle');
    }
  };

  const processAudio = async (uri: string) => {
    setCallState('processing');
    try {
      // 1. STT
      const text = await DoubaoService.transcribeAudio(uri);
      console.log('User said:', text);

      if (!text.trim()) {
        // If no speech detected, go back to listening or idle
        setCallState('idle'); // Or ask "I didn't hear that"
        return;
      }

      conversationHistory.current.push({ role: 'user', content: text });
      
      // Notify parent
      onMessagesGenerated?.([{ role: 'user', content: text }]);

      // 2. Chat
      const response = await DoubaoService.chat(conversationHistory.current, 'voice');
      console.log('Doubao says:', response);
      conversationHistory.current.push({ role: 'assistant', content: response });
      
      // Notify parent
      onMessagesGenerated?.([{ role: 'assistant', content: response }]);

      // 3. TTS
      await speak(response);

    } catch (error: any) {
      console.error('Processing error:', error);
      
      if (error.status === 403 && error.code === 'VOICE_FORBIDDEN_NON_MEMBER') {
         Alert.alert(
           'Membership Required',
           error.message || 'Please upgrade to Member to use Voice Chat.',
           [
             { text: 'Cancel', style: 'cancel', onPress: onClose },
             { text: 'Upgrade', onPress: () => {
                onClose();
                // Navigate to VIP screen (handled by parent or global nav ref ideally)
                // For now, just close and let parent handle or show alert
             }}
           ]
         );
      } else {
        await speak("Sorry, I had trouble connecting. Could you say that again?");
      }
    }
  };

  const speak = async (text: string) => {
    setCallState('speaking');
    
    // Stop any current speech
    await Speech.stop();

    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: 'en-US', // Or match detected language
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          setCallState('idle');
          resolve();
          // Auto-start listening after speaking (Turn-taking)
          // setTimeout(() => startRecording(), 500); 
          // Note: Auto-start requires good echo cancellation. 
          // Without it, the mic picks up the speaker. 
          // Safe bet: Go to idle, let user tap to speak, OR use a delay.
          // Doubao app usually auto-listens.
          // We will set state to IDLE and show "Tap to speak" hint for better UX in this demo.
          // Or we can try auto-listen with a delay.
          setTimeout(() => startRecording(), 800);
        },
        onError: (e) => {
          console.error('Speech error', e);
          setCallState('idle');
          resolve();
        }
      });
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Logic to actually mute input if needed
  };

  const toggleSpeaker = async () => {
    const newStatus = !isSpeakerOn;
    setIsSpeakerOn(newStatus);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: !newStatus,
    });
  };

  // Orb Interaction
  const handleOrbPress = () => {
    if (callState === 'listening') {
      handleUserFinishedSpeaking();
    } else if (callState === 'idle' || callState === 'speaking') {
      Speech.stop(); // Interrupt if speaking
      startRecording();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} // Deep gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
             // Minimize or close? Usually close for modal
             onClose();
          }} style={styles.minimizeBtn}>
            <Ionicons name="chevron-down" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.statusText}>
            {callState === 'connecting' && 'Connecting...'}
            {callState === 'listening' && 'Listening...'}
            {callState === 'processing' && 'Thinking...'}
            {callState === 'speaking' && 'Doubao is speaking...'}
            {callState === 'idle' && 'Tap orb to speak'}
          </Text>

          <TouchableOpacity onPress={handleOrbPress} activeOpacity={0.9}>
            <Animated.View style={[
              styles.orb, 
              { transform: [{ scale: pulseAnim }] },
              callState === 'listening' && styles.orbListening,
              callState === 'speaking' && styles.orbSpeaking,
              callState === 'processing' && styles.orbProcessing,
            ]}>
               {/* Inner Gradient for Orb */}
               <LinearGradient
                 colors={
                    callState === 'listening' ? ['#4facfe', '#00f2fe'] :
                    callState === 'speaking' ? ['#ff9a9e', '#fecfef'] :
                    ['#a18cd1', '#fbc2eb']
                 }
                 style={styles.orbInner}
               />
               <Ionicons 
                 name={callState === 'listening' ? 'mic' : callState === 'speaking' ? 'volume-high' : 'chatbubble-ellipses'} 
                 size={40} 
                 color="#fff" 
               />
            </Animated.View>
          </TouchableOpacity>

          {callState === 'listening' && (
             <Text style={styles.hintText}>Tap to send</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
            <View style={[styles.controlIconBg, isMuted && { backgroundColor: '#fff' }]}>
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "#000" : "#fff"} />
            </View>
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hangupBtn} onPress={onClose}>
            <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
            <View style={[styles.controlIconBg, isSpeakerOn && { backgroundColor: '#fff' }]}>
              <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={28} color={isSpeakerOn ? "#000" : "#fff"} />
            </View>
            <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Receiver'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 20,
  },
  minimizeBtn: {
    padding: 8,
  },
  duration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 40,
    letterSpacing: 1,
  },
  orb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
  orbInner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    position: 'absolute',
    opacity: 0.9,
  },
  orbListening: {
    // scale handled by anim
  },
  orbSpeaking: {
    
  },
  orbProcessing: {
    opacity: 0.8,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
  },
  controlIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
  },
  hangupBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
