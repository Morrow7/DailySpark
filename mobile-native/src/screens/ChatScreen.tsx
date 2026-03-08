import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
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
import * as Speech from 'expo-speech';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { sendChatMessage } from '../api/doubao';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPlaying?: boolean;
}

// 语言模式类型
type LanguageMode = 'en' | 'zh';

// 获取系统提示词
const getSystemPrompt = (lang: LanguageMode): string => {
  if (lang === 'zh') {
    return `你是一位友好的中文对话助手。请用中文回复用户。

规则：
1. 用友好、自然的语气回应
2. 回答要简洁明了（2-3句话为宜）
3. 可以询问用户的兴趣爱好，展开自然对话
4. 如果用户想练习英语，可以切换到英语模式`;
  }
  
  return `You are a professional English speaking practice assistant. Your task is to help users practice English speaking.

Rules:
1. Respond in a friendly, natural tone in English only
2. If the user makes grammar mistakes, gently point them out and provide the correct form
3. Ask about the user's interests to start natural conversations
4. Encourage the user to speak more English
5. Keep responses concise (2-3 sentences) suitable for voice conversation`;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPressed, setIsRecordingPressed] = useState(false); // 录音按钮是否被按下
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(true); // 默认开启语音模式
  const [languageMode, setLanguageMode] = useState<LanguageMode>('en'); // 默认英语模式
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const conversationHistory = useRef<{ role: string; content: string }[]>([
    { role: 'system', content: getSystemPrompt('en') },
  ]);

  // 动画值
  const pulseAnim = useSharedValue(1);
  const waveAnim1 = useSharedValue(0);
  const waveAnim2 = useSharedValue(0);
  const waveAnim3 = useSharedValue(0);
  const recordingOpacity = useSharedValue(0);

  // 录音动画
  useEffect(() => {
    if (isRecording) {
      recordingOpacity.value = withTiming(1, { duration: 200 });
      pulseAnim.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 8 })
        ),
        -1,
        true
      );
      
      waveAnim1.value = withRepeat(
        withSequence(
          withTiming(40, { duration: 600 }),
          withTiming(15, { duration: 600 })
        ),
        -1,
        true
      );
      
      waveAnim2.value = withRepeat(
        withSequence(
          withTiming(55, { duration: 800 }),
          withTiming(20, { duration: 800 })
        ),
        -1,
        true
      );
      
      waveAnim3.value = withRepeat(
        withSequence(
          withTiming(45, { duration: 700 }),
          withTiming(18, { duration: 700 })
        ),
        -1,
        true
      );
    } else {
      recordingOpacity.value = withTiming(0, { duration: 200 });
      pulseAnim.value = withTiming(1, { duration: 300 });
      waveAnim1.value = withTiming(0, { duration: 300 });
      waveAnim2.value = withTiming(0, { duration: 300 });
      waveAnim3.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording]);

  // 清理资源
  useEffect(() => {
    return () => {
      stopPlaying();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // 发送消息
  const sendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // 添加到对话历史
    conversationHistory.current.push({
      role: 'user',
      content: messageText.trim(),
    });

    try {
      console.log('调用API，当前对话历史:', conversationHistory.current);
      
      // 调用豆包API
      const response = await sendChatMessage(
        conversationHistory.current.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        }))
      );

      console.log('收到API响应:', response);

      // 添加到对话历史
      conversationHistory.current.push({
        role: 'assistant',
        content: response,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 语音模式下自动播放回复
      if (isVoiceMode) {
        await playMessageAudio(assistantMessage.id, response);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 显示错误提示
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: languageMode === 'en' 
          ? 'Sorry, I\'m having trouble connecting. Please try again later.'
          : '抱歉，连接出现问题，请稍后重试。',
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      Alert.alert(
        languageMode === 'en' ? 'Error' : '错误', 
        languageMode === 'en' 
          ? 'Failed to get response. Please check your network.'
          : '获取回复失败，请检查网络连接。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 防止重复触发
      if (isRecording || recordingRef.current) {
        console.log('已经在录音中，跳过');
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', '需要麦克风权限才能使用语音功能');
        return;
      }

      // 停止当前播放
      stopPlaying();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setIsRecordingPressed(true);
      setRecordingDuration(0);

      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          // 最长录音60秒
          if (prev >= 60) {
            handleRecordingStop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      console.log('录音已开始');
    } catch (error) {
      console.error('录音失败:', error);
      Alert.alert('错误', '无法开始录音，请重试');
      cleanupRecordingState();
    }
  };

  // 清理录音状态
  const cleanupRecordingState = () => {
    setIsRecording(false);
    setIsRecordingPressed(false);
    setRecordingDuration(0);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    recordingRef.current = null;
    recordingStartTimeRef.current = 0;
  };

  // 取消录音（不发送）
  const cancelRecording = async () => {
    console.log('取消录音');
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setIsRecordingPressed(false);
    setRecordingDuration(0);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch (error) {
      console.error('取消录音失败:', error);
    }
  };

  // 处理录音停止（供UI调用）
  const handleRecordingStop = () => {
    console.log('handleRecordingStop 被调用');
    setIsRecordingPressed(false);
    
    // 计算实际录音时长
    const actualDuration = recordingStartTimeRef.current 
      ? (Date.now() - recordingStartTimeRef.current) / 1000 
      : recordingDuration;
    
    console.log('实际录音时长:', actualDuration);
    
    // 如果录音时间太短，则取消
    if (actualDuration < 0.8) {
      console.log('录音时间太短，取消发送');
      cancelRecording();
      Alert.alert('提示', languageMode === 'en' ? 'Hold a bit longer to record' : '录音时间太短，请重试');
      return;
    }
    
    // 停止录音并发送
    stopRecordingAndSend();
  };

  // 停止录音并发送
  const stopRecordingAndSend = async () => {
    console.log('停止录音并发送，当前状态:', isRecording);
    
    if (!recordingRef.current || !isRecording) {
      console.log('没有正在进行的录音');
      return;
    }

    // 清除计时器
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setIsRecordingPressed(false);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        recordingStartTimeRef.current = 0;

        if (uri) {
          console.log('录音文件URI:', uri);
          await processVoiceInput(uri);
        }
      }
    } catch (error) {
      console.error('停止录音失败:', error);
      Alert.alert('错误', languageMode === 'en' ? 'Recording failed, please try again' : '录音处理失败，请重试');
      cleanupRecordingState();
    }
  };

  // 处理语音输入
  const processVoiceInput = async (audioUri: string) => {
    console.log('处理语音输入:', audioUri);
    setIsLoading(true);
    
    try {
      // 调用豆包语音识别API
      const { speechToText } = await import('../api/doubao');
      const transcript = await speechToText(audioUri);
      
      console.log('语音识别结果:', transcript);
      
      if (transcript && transcript.trim()) {
        // 自动发送识别的内容
        await sendMessage(transcript);
      } else {
        Alert.alert(
          languageMode === 'en' ? 'Tips' : '提示',
          languageMode === 'en' 
            ? 'Could not recognize speech, please try again'
            : '未能识别语音，请重试'
        );
      }
    } catch (error) {
      console.error('语音识别失败:', error);
      
      // 如果语音识别失败，显示错误但允许用户手动输入
      Alert.alert(
        languageMode === 'en' ? 'Recognition Failed' : '识别失败',
        languageMode === 'en' 
          ? 'Speech recognition failed. Please type your message.'
          : '语音识别失败，请尝试打字输入。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 播放消息语音
  const playMessageAudio = async (messageId: string, text: string) => {
    try {
      // 停止当前播放
      stopPlaying();

      // 如果点击的是正在播放的消息，则停止
      if (playingMessageId === messageId) {
        setPlayingMessageId(null);
        return;
      }

      setPlayingMessageId(messageId);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // 使用系统TTS
      Speech.speak(text, {
        language: languageMode === 'en' ? 'en-US' : 'zh-CN',
        rate: languageMode === 'en' ? 0.9 : 1.0,
        pitch: 1.0,
        onDone: () => {
          setPlayingMessageId(null);
        },
        onStopped: () => {
          setPlayingMessageId(null);
        },
        onError: () => {
          setPlayingMessageId(null);
        },
      });
    } catch (error) {
      console.error('语音播放失败:', error);
      setPlayingMessageId(null);
    }
  };

  // 停止播放
  const stopPlaying = () => {
    Speech.stop();
    setPlayingMessageId(null);
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  // 切换语言模式
  const toggleLanguage = () => {
    const newMode = languageMode === 'en' ? 'zh' : 'en';
    setLanguageMode(newMode);
    
    // 更新系统提示词
    const systemPrompt = getSystemPrompt(newMode);
    conversationHistory.current = [
      { role: 'system', content: systemPrompt },
    ];
    
    console.log('切换到语言模式:', newMode, '系统提示词:', systemPrompt);
    
    // 显示提示
    const message = newMode === 'en' 
      ? '已切换到英语模式\nSwitched to English Mode'
      : '已切换到中文模式';
    
    Alert.alert('语言切换', message);
    
    // 清空对话历史重新开始
    setMessages([]);
    stopPlaying();
  };

  // 初始化时设置系统提示词
  useEffect(() => {
    const systemPrompt = getSystemPrompt(languageMode);
    conversationHistory.current = [
      { role: 'system', content: systemPrompt },
    ];
    console.log('初始化聊天，语言模式:', languageMode, '系统提示词:', systemPrompt);
  }, []);

  // 清空对话
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
            conversationHistory.current = [{ role: 'system', content: getSystemPrompt(languageMode) }];
            stopPlaying();
          },
        },
      ]
    );
  };

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染消息
  const renderMessage = ({ item }: { item: Message }) => {
    const isPlaying = playingMessageId === item.id;

    return (
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
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={() => playMessageAudio(item.id, item.content)}
            >
              <Ionicons
                name={isPlaying ? 'volume-high' : 'volume-medium'}
                size={16}
                color={isPlaying ? palette.primary : palette.textSecondary}
              />
              <Text style={[styles.playButtonText, isPlaying && styles.playButtonTextActive]}>
                {isPlaying ? '播放中...' : '朗读'}
              </Text>
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
  };

  // 动画样式
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

  const recordingOverlayStyle = useAnimatedStyle(() => ({
    opacity: recordingOpacity.value,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 录音遮罩层 */}
      <Animated.View 
        style={[styles.recordingOverlay, recordingOverlayStyle]} 
        pointerEvents={isRecording ? 'auto' : 'none'}
      >
        <TouchableOpacity 
          style={styles.recordingOverlayTouchable}
          onPress={() => {
            // 点击空白处取消录音
            if (isRecording) {
              cancelRecording();
            }
          }}
          activeOpacity={1}
        >
          <View style={styles.recordingPanel}>
            <Animated.View style={[styles.recordingPulse, pulseStyle]}>
              <Ionicons name="mic" size={40} color={palette.error} />
            </Animated.View>
            
            <View style={styles.waveContainer}>
              <Animated.View style={[styles.waveBar, wave1Style]} />
              <Animated.View style={[styles.waveBar, wave2Style]} />
              <Animated.View style={[styles.waveBar, wave3Style]} />
              <Animated.View style={[styles.waveBar, wave2Style]} />
              <Animated.View style={[styles.waveBar, wave1Style]} />
            </View>

            <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
            <Text style={styles.recordingText}>正在录音，松开手指发送</Text>
            <Text style={styles.recordingHint}>最长60秒</Text>

            {/* 取消按钮 */}
            <TouchableOpacity 
              style={styles.cancelRecordingButton}
              onPress={cancelRecording}
            >
              <Ionicons name="close-circle" size={24} color={palette.error} />
              <Text style={styles.cancelRecordingText}>取消</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 头部 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>
              {languageMode === 'en' ? 'AI Speaking Practice' : 'AI口语练习'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {languageMode === 'en' 
                ? (isVoiceMode ? 'Voice Mode - Hold to speak' : 'Text Mode')
                : (isVoiceMode ? '语音模式 - 按住说话' : '文字模式')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {/* 语言切换按钮 */}
            <TouchableOpacity
              style={styles.langButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.langButtonText}>
                {languageMode === 'en' ? 'EN' : '中'}
              </Text>
            </TouchableOpacity>
            
            {/* 语音/文字模式切换 */}
            <TouchableOpacity
              style={[styles.modeButton, isVoiceMode && styles.modeButtonActive]}
              onPress={() => {
                setIsVoiceMode(!isVoiceMode);
                stopPlaying();
              }}
            >
              <Ionicons
                name={isVoiceMode ? 'mic' : 'chatbubble'}
                size={20}
                color={isVoiceMode ? palette.primary : palette.cloud}
              />
            </TouchableOpacity>
            
            {/* 清空按钮 */}
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
              <Ionicons name="mic-circle" size={80} color={palette.grass} />
            </View>
            <Text style={styles.emptyTitle}>
              {languageMode === 'en' ? 'Start Speaking Practice' : '开始口语练习'}
            </Text>
            <Text style={styles.emptyText}>
              {languageMode === 'en'
                ? (isVoiceMode 
                    ? 'Hold the mic button below to talk with AI in English'
                    : 'Type a message to start chatting with AI')
                : (isVoiceMode 
                    ? '按住下方麦克风按钮，用英语和AI对话'
                    : '输入文字开始和AI助手聊天')}
            </Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>
                {languageMode === 'en' ? '💡 Try saying:' : '💡 试试说:'}
              </Text>
              {languageMode === 'en' ? (
                <>
                  <Text style={styles.tipsText}>"Hello, how are you?"</Text>
                  <Text style={styles.tipsText}>"Can you help me practice English?"</Text>
                  <Text style={styles.tipsText}>"Tell me about yourself"</Text>
                </>
              ) : (
                <>
                  <Text style={styles.tipsText}>"你好，我想练习英语"</Text>
                  <Text style={styles.tipsText}>"今天天气怎么样？"</Text>
                  <Text style={styles.tipsText}>"能帮我介绍一些学习方法吗？"</Text>
                </>
              )}
            </View>
          </View>
        }
      />

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        {isVoiceMode ? (
          // 语音模式 - 按住说话按钮
          {/* 语音输入 */}
          <View style={styles.voiceInputContainer}>
            <View
              style={[
                styles.voiceButton,
                isRecordingPressed && styles.voiceButtonPressed
              ]}
              onTouchStart={() => {
                console.log('触摸开始 - 开始录音');
                startRecording();
              }}
              onTouchEnd={() => {
                console.log('触摸结束 - 停止录音');
                handleRecordingStop();
              }}
            >
              <LinearGradient
                colors={isRecordingPressed ? [palette.error, '#ff6b6b'] : [palette.primary, palette.primaryLight]}
                style={styles.voiceButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={isRecordingPressed ? "radio-button-on" : "mic"} 
                  size={32} 
                  color={palette.cloud} 
                />
              </LinearGradient>
            </View>
            <Text style={styles.voiceHint}>
              {isRecordingPressed 
                ? (languageMode === 'en' ? 'Release to send' : '松开发送')
                : (languageMode === 'en' ? 'Hold to speak' : '按住说话')
              }
            </Text>
          </View>
        ) : (
          // 文字模式
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.modeSwitchButton}
              onPress={() => setIsVoiceMode(true)}
            >
              <Ionicons name="mic" size={22} color={palette.primary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={languageMode === 'en' ? 'Type a message...' : '输入消息...'}
                placeholderTextColor={palette.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={palette.cloud} />
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
  // 录音遮罩
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  recordingPanel: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    width: width * 0.8,
  },
  recordingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: spacing.lg,
  },
  waveBar: {
    width: 6,
    backgroundColor: palette.primary,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  recordingDuration: {
    ...typography.h2,
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  recordingText: {
    ...typography.body1,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  recordingHint: {
    ...typography.caption,
    color: palette.textLight,
  },
  cancelRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.error + '10',
    borderRadius: borderRadius.lg,
  },
  cancelRecordingText: {
    ...typography.body2,
    color: palette.error,
    marginLeft: spacing.xs,
  },
  recordingOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 头部
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
    alignItems: 'center',
  },
  langButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  langButtonText: {
    ...typography.body2,
    color: palette.cloud,
    fontWeight: '700',
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
  // 消息列表
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
    maxWidth: width * 0.72,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: palette.background,
    alignSelf: 'flex-start',
  },
  playButtonActive: {
    backgroundColor: palette.primary + '15',
  },
  playButtonText: {
    ...typography.caption,
    color: palette.textSecondary,
    marginLeft: 4,
  },
  playButtonTextActive: {
    color: palette.primary,
  },
  // 空状态
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body2,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  tipsContainer: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: width * 0.8,
    ...shadows.sm,
  },
  tipsTitle: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipsText: {
    ...typography.body2,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  // 输入区域
  inputContainer: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : spacing.md,
  },
  // 语音输入
  voiceInputContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  voiceButtonPressed: {
    transform: [{ scale: 1.1 }],
  },
  voiceButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceHint: {
    ...typography.caption,
    color: palette.textSecondary,
    marginTop: spacing.sm,
  },
  // 文字输入
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  modeSwitchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  input: {
    ...typography.body1,
    color: palette.textPrimary,
    height: 44,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: palette.textLight,
  },
});

export default ChatScreen;
