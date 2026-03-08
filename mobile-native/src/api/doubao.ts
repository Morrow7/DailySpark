import Constants from 'expo-constants';

// 使用用户提供的豆包 API Key
const DOUBAO_API_KEY = '0cba16ae-e1d1-482f-a152-17aca39ae8ec';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3';

// 模型配置
const CHAT_MODEL = 'doubao-lite-4k';  // 对话模型
const TTS_MODEL = 'doubao-tts';       // 语音合成模型

// 豆包API响应类型
export interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DoubaoResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: DoubaoMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 语音合成响应
export interface TTSResponse {
  audio_url: string;
  duration: number;
}

/**
 * 发送聊天消息到豆包API
 */
export async function sendChatMessage(
  messages: DoubaoMessage[],
  model: string = CHAT_MODEL
): Promise<string> {
  try {
    const response = await fetch(`${DOUBAO_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API请求失败: ${error}`);
    }

    const data: DoubaoResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('豆包API调用失败:', error);
    throw error;
  }
}

/**
 * 流式聊天 - 用于语音对话
 */
export async function* streamChatMessage(
  messages: DoubaoMessage[],
  model: string = CHAT_MODEL
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(`${DOUBAO_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('流式API调用失败:', error);
    throw error;
  }
}

/**
 * 语音合成 - 文本转语音
 */
export async function textToSpeech(
  text: string,
  voice: string = 'zh_female_xiaoyi'
): Promise<string> {
  try {
    const response = await fetch(`${DOUBAO_API_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        voice: voice,
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`语音合成失败: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('语音合成失败:', error);
    throw error;
  }
}

/**
 * 语音识别 - 语音转文本
 */
export async function speechToText(audioUri: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);
    formData.append('model', 'doubao-asr');

    const response = await fetch(`${DOUBAO_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`语音识别失败: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('语音识别失败:', error);
    throw error;
  }
}

/**
 * 创建语音对话会话
 */
export function createVoiceConversation() {
  const messages: DoubaoMessage[] = [
    {
      role: 'system',
      content: '你是一个友好、耐心的AI助手，擅长用简单易懂的方式回答问题。请以自然、对话的方式回应用户。',
    },
  ];

  return {
    messages,
    async sendMessage(userMessage: string): Promise<string> {
      messages.push({ role: 'user', content: userMessage });
      const response = await sendChatMessage(messages);
      messages.push({ role: 'assistant', content: response });
      return response;
    },
    async *streamMessage(userMessage: string): AsyncGenerator<string, void, unknown> {
      messages.push({ role: 'user', content: userMessage });
      let fullResponse = '';
      
      for await (const chunk of streamChatMessage(messages)) {
        fullResponse += chunk;
        yield chunk;
      }
      
      messages.push({ role: 'assistant', content: fullResponse });
    },
    clearHistory() {
      messages.length = 1; // 保留system消息
    },
  };
}
