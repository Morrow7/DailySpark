import Constants from 'expo-constants';

// 使用用户提供的豆包 API Key
const DOUBAO_API_KEY = '0cba16ae-e1d1-482f-a152-17aca39ae8ec';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3';

// 模型配置 - 使用正确的模型ID
const CHAT_MODEL = 'doubao-lite-4k';  // 对话模型

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

/**
 * 发送聊天消息到豆包API
 */
export async function sendChatMessage(
  messages: DoubaoMessage[],
  model: string = CHAT_MODEL
): Promise<string> {
  console.log('发送消息到豆包API:', JSON.stringify(messages, null, 2));
  
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

    console.log('API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', errorText);
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }

    const data: DoubaoResponse = await response.json();
    console.log('API响应数据:', data);
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('API返回内容为空');
    }
    
    return content;
  } catch (error) {
    console.error('豆包API调用失败:', error);
    throw error;
  }
}

/**
 * 语音合成 - 文本转语音 (使用系统TTS作为备选)
 */
export async function textToSpeech(
  text: string,
  voice: string = 'zh_female_xiaoyi'
): Promise<string> {
  console.log('调用TTS:', text.substring(0, 50) + '...');
  
  try {
    const response = await fetch(`${DOUBAO_API_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'speech-01',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`语音合成失败: ${response.status}`);
    }

    // 返回音频URL或base64数据
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('语音合成失败:', error);
    throw error;
  }
}

/**
 * 语音识别 - 语音转文本 (需要后端支持)
 */
export async function speechToText(audioUri: string): Promise<string> {
  console.log('语音识别:', audioUri);
  
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);
    formData.append('model', 'speech-to-text-01');

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
 * 创建语音对话会话 - 简化版本
 */
export function createVoiceConversation() {
  const messages: DoubaoMessage[] = [];

  return {
    messages,
    async sendMessage(userMessage: string): Promise<string> {
      messages.push({ role: 'user', content: userMessage });
      
      const response = await sendChatMessage(messages);
      messages.push({ role: 'assistant', content: response });
      
      return response;
    },
    clearHistory() {
      messages.length = 0;
    },
  };
}
