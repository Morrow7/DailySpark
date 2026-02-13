import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';

interface ChatAudioBubbleProps {
  currentMessage: any;
  position: 'left' | 'right';
}

export const ChatAudioBubble: React.FC<ChatAudioBubbleProps> = ({ currentMessage, position }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async () => {
    if (!currentMessage.audio) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playFromPositionAsync(0);
          setIsPlaying(true);
        }
      } else {
        setLoading(true);
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: currentMessage.audio },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error playing sound', error);
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        // sound?.setPositionAsync(0); 
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.round(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={[styles.container, position === 'right' ? styles.right : styles.left]}>
      <TouchableOpacity onPress={playSound} style={styles.playBtn}>
        {loading ? (
          <ActivityIndicator size="small" color={position === 'right' ? '#fff' : palette.primary} />
        ) : (
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color={position === 'right' ? '#fff' : palette.primary} 
          />
        )}
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={[styles.duration, position === 'right' ? styles.textRight : styles.textLeft]}>
          {duration ? formatTime(duration) : 'Voice Message'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    minWidth: 120,
    borderRadius: 15,
    margin: 5,
  },
  left: {
    // GiftedChat default bubble styling
  },
  right: {
    // GiftedChat default bubble styling
  },
  playBtn: {
    marginRight: 10,
  },
  info: {
    justifyContent: 'center',
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLeft: {
    color: palette.text,
  },
  textRight: {
    color: '#fff',
  },
});
