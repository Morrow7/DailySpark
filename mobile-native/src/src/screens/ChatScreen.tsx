import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { sendChatMessage, createVoiceConversation, textToSpeech } from '../api/doubao';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPlaying?: boolean;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const voiceConversation = useRef(createVoiceConversation());
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 动画值 - 使用 Reanimated 的 useSharedValue
  const pulseAnim = useSharedValue(1);
  const waveAnim1 = useSharedValue(0);
  const waveAnim2 = useSharedValue(0);
  const waveAnim3 = useSharedValue(0);

  useEffect(() => {
    // 录音动画
    if (isRecording) {
      pulseAnim.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        -1,
        true
      );
      
      waveAnim1.value = withRepeat(
        withSequence(
          withSpring(30, { damping: 5 }),
          withSpring(10, { damping: 5 })
        ),
        -1,
        true
      );
      
      waveAnim2.value = withRepeat(
        withSequence(
          withSpring(40, { damping: 5 }),
          withSpring(15, { damping: 5 })
        ),
        -1,
        true
      );
      
      waveAnim3.value = withRepeat(
        withSequence(
          withSpring(35, { damping: 5 }),
          withSpring(12, { damping: 5 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 300 });
      waveAnim1.value = withTiming(0, { duration: 300 });
      waveAnim2.value = withTiming(0, { duration: 300 });
      waveAnim3.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording, pulseAnim, waveAnim1, waveAnim2, waveAnim3]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await voiceConversation.current.sendMessage(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // 语音模式下自动播放回复
      if (isVoiceMode) {
        await playTextToSpeech(response);
      }
    } catch (error) {
      Alert.alert('错误', '发送消息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', '需要麦克风权限才能录音');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
      Alert.alert('错误', '无法开始录音');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        // 这里应该调用语音识别API
        // 由于豆包ASR需要后端支持，这里模拟语音识别结果
        const mockTranscript = '你好，我想练习英语口语';
        setInputText(mockTranscript);
        
        // 自动发送识别结果
        setTimeout(() => {
          sendMessage();
        }, 500);
      }
    } catch (error) {
      console.error('停止录音失败:', error);
    }
  };

  const playTextToSpeech = async (text: string) => {
    try {
      // 停止之前的播放
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      // 调用豆包TTS API
      const audioUrl = await textToSpeech(text);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
    } catch (error) {
      console.error('语音播放失败:', error);
    }
  };

  const clearChat = () => {
    Alert.alert(
      '清空对话',
      '确定要清空所有对话记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            voiceConversation.current.clearHistory();
          }
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {item.role === 'assistant' && (
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[palette.primary, palette.primaryLight]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="leaf" size={16} color={palette.cloud} />
          </LinearGradient>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
          ]}
        >
          {item.content}
        </Text>
        
        {item.role === 'assistant' && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playTextToSpeech(item.content)}
          >
            <Ionicons name="volume-medium" size={16} color={palette.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      {item.role === 'user' && (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: palette.grass }]}>
            <Ionicons name="person" size={16} color={palette.cloud} />
          </View>
        </View>
      )}
    </View>
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const wave1Style = useAnimatedStyle(() => ({
    height: waveAnim1.value,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    height: waveAnim2.value,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    height: waveAnim3.value,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 头部 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>AI语音助手</Text>
            <Text style={styles.headerSubtitle}>Powered by 豆包</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                isVoiceMode && styles.modeButtonActive,
              ]}
              onPress={() => setIsVoiceMode(!isVoiceMode)}
            >
              <Ionicons
                name={isVoiceMode ? 'mic' : 'chatbubble'}
                size={20}
                color={isVoiceMode ? palette.primary : palette.cloud}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
              <Ionicons name="trash-outline" size={20} color={palette.cloud} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles" size={60} color={palette.grass} />
            </View>
            <Text style={styles.emptyTitle}>开始对话</Text>
            <Text style={styles.emptyText}>
              {isVoiceMode
                ? '点击麦克风按钮，用语音和AI助手交流'
                : '输入文字或点击麦克风，开始和AI助手聊天'}
            </Text>
          </View>
        }
      />

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        {isVoiceMode && isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.waveContainer}>
              <Animated.View style={[styles.waveBar, wave1Style]} />
              <Animated.View style={[styles.waveBar, wave2Style]} />
              <Animated.View style={[styles.waveBar, wave3Style]} />
              <Animated.View style={[styles.waveBar, wave2Style]} />
              <Animated.View style={[styles.waveBar, wave1Style]} />
            </View>
            <Text style={styles.recordingText}>正在录音...</Text>
            <TouchableOpacity
              style={styles.stopRecordingButton}
              onPress={stopRecording}
            >
              <Ionicons name="stop" size={24} color={palette.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.micButton}
              onPressIn={startRecording}
              onPressOut={isRecording ? stopRecording : undefined}
            >
              <Animated.View style={[isRecording && pulseStyle]}>
                <Ionicons
                  name={isRecording ? 'radio-button-on' : 'mic'}
                  size={24}
                  color={isRecording ? palette.error : palette.primary}
                />
              </Animated.View>
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="输入消息..."
                placeholderTextColor={palette.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <Ionicons name="ellipsis-horizontal" size={20} color={palette.cloud} />
              ) : (
                <Ionicons name="send" size={20} color={palette.cloud} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: palette.cloud,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: palette.cloud,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: palette.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: palette.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body1,
    lineHeight: 22,
  },
  userMessageText: {
    color: palette.cloud,
  },
  assistantMessageText: {
    color: palette.textPrimary,
  },
  playButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: palette.primary + '10',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.grassLight + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: palette.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body2,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  inputContainer: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    maxHeight: 100,
  },
  input: {
    ...typography.body1,
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: palette.textLight,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    height: 50,
  },
  waveBar: {
    width: 4,
    backgroundColor: palette.primary,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  recordingText: {
    ...typography.body2,
    color: palette.primary,
    marginHorizontal: spacing.md,
  },
  stopRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: palette.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
