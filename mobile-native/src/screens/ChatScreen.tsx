import { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Platform,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Send,
  Composer,
  Avatar,
  MessageText,
} from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { ChatAudioBubble } from '../components/ChatAudioBubble';
import PhoneCallModal from '../components/PhoneCallModal';
import { v4 as uuidv4 } from 'uuid';
import * as Speech from 'expo-speech';
import { palette, radius, spacing } from '../theme';
import { ChatStorage } from '../utils/storage';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' },
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
};

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [text, setText] = useState('');
  const [loadEarlier, setLoadEarlier] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [allHistoryLoaded, setAllHistoryLoaded] = useState(false);
  const PAGE_SIZE = 20;
  const historyRef = useRef<IMessage[]>([]); // Store full history in ref to simulate pagination

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [targetLang, setTargetLang] = useState(LANGUAGES[0]); // Default Chinese
  const [showPhoneCall, setShowPhoneCall] = useState(false);

  // Voice animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const doubaoEndpoint = process.env.EXPO_PUBLIC_DOUBAO_ENDPOINT ?? 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  const doubaoApiKey = process.env.EXPO_PUBLIC_DOUBAO_API_KEY ?? '';
  const doubaoModel = process.env.EXPO_PUBLIC_DOUBAO_MODEL ?? 'doubao-seed-1-8-251228';

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [meterLevel, setMeterLevel] = useState(0);

  // Load history on mount
  useEffect(() => {
    loadHistory();
    // Initialize Web Speech API if on web
    if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleVoiceSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        Alert.alert('Voice Error', 'Could not recognize speech. Please try again.');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const loadHistory = async () => {
    const history = await ChatStorage.loadHistory();
    if (history && history.length > 0) {
      // Convert simple messages to GiftedChat IMessage format
      const giftedMessages = history.map((msg: any) => ({
        _id: uuidv4(),
        text: msg.content,
        createdAt: new Date(),
        user: {
          _id: msg.role === 'user' ? 1 : 2,
          name: msg.role === 'user' ? 'User' : 'Doubao AI',
          avatar: msg.role === 'assistant' ? 'https://img.icons8.com/color/48/000000/bot.png' : undefined,
        },
      })).reverse(); // Newest first

      historyRef.current = giftedMessages;

      // Load first page
      setMessages(giftedMessages.slice(0, PAGE_SIZE));
      setLoadEarlier(giftedMessages.length > PAGE_SIZE);
    } else {
      const initialMsg = {
        _id: 1,
        text: 'Hello! I am Doubao AI. How can I help you practice English today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Doubao AI',
          avatar: 'https://img.icons8.com/color/48/000000/bot.png',
        },
      };
      setMessages([initialMsg]);
      historyRef.current = [initialMsg];
    }
  };

  const onLoadEarlier = () => {
    if (isLoadingEarlier || allHistoryLoaded) return;
    setIsLoadingEarlier(true);

    setTimeout(() => {
      const currentLength = messages.length;
      const nextBatch = historyRef.current.slice(currentLength, currentLength + PAGE_SIZE);

      if (nextBatch.length > 0) {
        setMessages(prev => GiftedChat.prepend(prev, nextBatch));
        if (currentLength + nextBatch.length >= historyRef.current.length) {
          setLoadEarlier(false);
          setAllHistoryLoaded(true);
        }
      } else {
        setLoadEarlier(false);
        setAllHistoryLoaded(true);
      }
      setIsLoadingEarlier(false);
    }, 500); // Simulate network delay
  };

  const handleClearHistory = async () => {
    await ChatStorage.clearHistory();
    setMessages([]);
    historyRef.current = [];
    setShowSettings(false);
    loadHistory(); // Reload initial message
  };

  const onLongPress = (context: any, message: any) => {
    const options = ['Copy Text', 'Delete Message', 'Cancel'];
    const cancelButtonIndex = 2;

    context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: number) => {
        if (buttonIndex === 0) {
          // Copy
          // Clipboard.setString(message.text); // Need expo-clipboard
          console.log('Copy', message.text);
        } else if (buttonIndex === 1) {
          // Delete
          setMessages(previousMessages => previousMessages.filter(m => m._id !== message._id));
          // Update history ref
          historyRef.current = historyRef.current.filter(m => m._id !== message._id);
          // Update storage (simplified: just overwrite with current messages reversed)
          // In real app, we would update specific ID in DB
        }
      }
    );
  };

  const speakText = (content: string) => {
    Speech.speak(content, {
      language: 'en-US',
      rate: 0.9,
    });
  };

  const callDoubaoApi = async (messages: any[]) => {
    return fetch(doubaoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doubaoApiKey}`,
      },
      body: JSON.stringify({
        model: doubaoModel,
        messages: [
          { role: 'system', content: 'You are a helpful English tutor. Please reply in English.' },
          ...messages
        ],
        stream: false,
      }),
    });
  };

  const onSend = async (newMessages: IMessage[] = []) => {
    const userMsg = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setLoading(true);

    try {
      let userText = userMsg.text;
      if (!userText && userMsg.audio) {
        userText = "I sent a voice message.";
      }

      const res = await callDoubaoApi([
        { role: 'user', content: userText },
      ]);

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        setError(`Error ${res.status}: ${data?.message ?? 'Unknown'}`);
        setLoading(false);
        return;
      }

      const replyText =
        data?.output?.[0]?.content?.[0]?.text ??
        data?.output_text ??
        data?.choices?.[0]?.message?.content ??
        data?.result?.message ??
        'No Content';

      const botMsg: IMessage = {
        _id: uuidv4(),
        text: replyText,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Doubao AI',
          avatar: 'https://img.icons8.com/color/48/000000/bot.png',
        },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMsg]));
      speakText(replyText);

      // Save history (simplified)
      // In real app, convert back to simple format or store IMessage directly

    } catch (err: any) {
      setError(err?.name === 'AbortError' ? 'Timeout' : 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSend = (text: string) => {
    const msg: IMessage = {
      _id: uuidv4(),
      text: text,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };
    onSend([msg]);
  };

  // ... (Keep existing Audio/Permission/Speech logic)

  const startListening = async () => {
    try {
      // Check permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant microphone permission to use voice chat.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsListening(true);

      // Metering for animation
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering) {
          // Normalize metering (usually -160 to 0) to 0-1 range roughly
          const level = Math.max(0, (status.metering + 60) / 60);
          setMeterLevel(level);

          // Animate pulse based on level
          Animated.timing(scaleAnim, {
            toValue: 1 + level * 0.5,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
      });

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopListening = async () => {
    if (!recording) return;

    try {
      setIsListening(false);
      setRecording(null);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (!uri) return;

      // Send to STT API (Mocking for now as we don't have a real STT backend yet, 
      // or we can try to use Web Speech if on Web, but this logic handles Native)

      // For this demo, since we don't have a real Whisper/STT API key configured,
      // we will simulate recognition or fallback to Web Speech on Web.

      // If Native, we would upload `uri` to an endpoint.
      console.log('Recording stopped, file at:', uri);

      const audioMsg: IMessage = {
        _id: uuidv4(),
        text: '',
        audio: uri,
        createdAt: new Date(),
        user: { _id: 1 },
      };
      onSend([audioMsg]);

      // Reset animation
      scaleAnim.setValue(1);

    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const toggleListening = () => {
    if (Platform.OS === 'web') {
      // Use Web Speech API logic
      if (recognitionRef.current) {
        if (isListening) recognitionRef.current.stop();
        else recognitionRef.current.start();
      } else {
        Alert.alert('Not Supported', 'Web Speech API not found.');
      }
    } else {
      // Use Expo AV
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendContainer}>
        <Ionicons name="send" size={24} color={palette.primary} />
      </View>
    </Send>
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.bubbleLeft,
        right: styles.bubbleRight,
      }}
      textStyle={{
        left: styles.textLeft,
        right: styles.textRight,
      }}
    />
  );

  const handlePhoneMessages = (newMsgs: { role: 'user' | 'assistant', content: string }[]) => {
    const giftedMsgs = newMsgs.map(msg => ({
      _id: uuidv4(),
      text: msg.content,
      createdAt: new Date(),
      user: {
        _id: msg.role === 'user' ? 1 : 2,
        name: msg.role === 'user' ? 'User' : 'Doubao AI',
        avatar: msg.role === 'assistant' ? 'https://img.icons8.com/color/48/000000/bot.png' : undefined,
      },
    }));

    const formattedMsgs = giftedMsgs.reverse(); // Newest first for GiftedChat

    setMessages(previousMessages => GiftedChat.append(previousMessages, formattedMsgs));

    // Add to history ref (newest first)
    historyRef.current = [...formattedMsgs, ...historyRef.current];

    // Persist to storage
    const currentHistory = historyRef.current.map(m => ({
      role: m.user._id === 1 ? 'user' : 'assistant',
      content: m.text,
    })).reverse(); // Oldest first for storage format usually
    ChatStorage.saveHistory(currentHistory);
  };

  const handlePhoneCallPress = async () => {
    // Check membership locally first (fast feedback)
    try {
      const userInfoStr = await AsyncStorage.getItem('user_info');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        // Check if user has active membership
        const isMember = userInfo.membership && 
                         userInfo.membership.level !== 'free' && 
                         (!userInfo.membership.endTime || new Date(userInfo.membership.endTime) > new Date());
        
        if (!isMember) {
          Alert.alert(
            '无法使用电话语音聊天',
            '此功能为会员专属。开通会员即可使用电话语音聊天与普通文本聊天两项服务。',
            [
              { text: '知道了', style: 'cancel' },
              { text: '去开通会员', onPress: () => navigation.navigate('Vip') }
            ]
          );
          return;
        }
      } else {
        // Not logged in or no info
         Alert.alert('Please Login', 'You need to login to use this feature.');
         return;
      }
    } catch (e) {
      console.log('Error checking membership', e);
    }
    
    setShowPhoneCall(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Voice Chat</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handlePhoneCallPress} style={{ marginRight: 16 }}>
            <Ionicons name="call-outline" size={24} color={palette.primary} />
          </TouchableOpacity>
          <View style={[styles.statusBadge, { marginRight: 8 }]}>
            <View style={[styles.statusDot, { backgroundColor: loading ? palette.warning : palette.success }]} />
            <Text style={styles.statusText}>{loading ? 'Thinking...' : 'Online'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={24} color={palette.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{ _id: 1 }}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderBubble={renderBubble}
          renderMessageAudio={(props) => <ChatAudioBubble {...props} />}
          text={text}
          onInputTextChanged={setText}
          alwaysShowSend
          renderAvatarOnTop
          renderUsernameOnMessage
          bottomOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust based on tab bar
          loadEarlier={loadEarlier}
          onLoadEarlier={onLoadEarlier}
          isLoadingEarlier={isLoadingEarlier}
          onLongPress={onLongPress}
        />

        {/* Voice Overlay Control */}
        <View style={styles.voiceOverlay}>
          <TouchableOpacity
            style={[styles.mainMicBtn, isListening && styles.listeningBtn]}
            onPress={toggleListening}
          >
            <Ionicons name={isListening ? "mic-off" : "mic"} size={32} color="#fff" />
          </TouchableOpacity>
          {isListening && (
            <Animated.Text style={[styles.listeningText, { opacity: scaleAnim }]}>
              Listening...
            </Animated.Text>
          )}
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Translation Target Language</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.langList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langChip, targetLang.code === item.code && styles.activeLangChip]}
                  onPress={() => setTargetLang(item)}
                >
                  <Text style={[styles.langText, targetLang.code === item.code && styles.activeLangText]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.clearBtnText}>Clear Chat History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Phone Call Modal */}
      <PhoneCallModal
        visible={showPhoneCall}
        onClose={() => setShowPhoneCall(false)}
        onMessagesGenerated={handlePhoneMessages}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  header: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    zIndex: 10,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: palette.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.inputBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: palette.textLight, fontWeight: '600' },

  inputToolbar: {
    backgroundColor: palette.card,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingVertical: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
  },
  bubbleRight: {
    backgroundColor: palette.primary,
  },
  textLeft: {
    color: palette.text,
  },
  textRight: {
    color: '#fff',
  },

  voiceOverlay: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'center',
  },
  mainMicBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  listeningBtn: {
    backgroundColor: palette.danger,
    transform: [{ scale: 1.1 }]
  },
  listeningText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    fontSize: 12,
    overflow: 'hidden',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: palette.textLight },
  langList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  langChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.inputBg, marginRight: 8, marginBottom: 8 },
  activeLangChip: { backgroundColor: palette.primary },
  langText: { color: palette.text },
  activeLangText: { color: '#fff', fontWeight: 'bold' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.danger, padding: 15, borderRadius: 12, marginTop: 10 },
  clearBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});
