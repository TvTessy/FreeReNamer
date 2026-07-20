import type { ApiConfig } from './settings/ai-config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  /** 用于取消请求的信号 */
  signal?: AbortSignal;
  /** 超时时间（毫秒），默认 30000 */
  timeout?: number;
}

interface OllamaRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: false;
  format: {
    type: 'object';
    properties: { code: { type: 'string' } };
    required: ['code'];
  };
}

interface OllamaResponse {
  message: { role: string; content: string };
}

interface OpenAIRequest {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens: number;
  stream?: boolean;
}

interface OpenAIResponse {
  choices: { message: { role: string; content: string } }[];
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: { role: string; content: string }[];
}

interface ClaudeResponse {
  content: { type: string; text: string }[];
  role: string;
}

// ==================== 主入口 ====================

export async function chat(
  config: ApiConfig,
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatMessage> {
  switch (config.type) {
    case 'ollama':
      return chatOllama(config, messages, options);
    case 'claude':
      return chatClaude(config, messages, options);
    default:
      // openai, deepseek, groq, openai-compatible
      return chatOpenAI(config, messages, options);
  }
}

// ==================== Ollama ====================

async function chatOllama(
  config: ApiConfig,
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatMessage> {
  const url = `${stripTrailingSlash(config.baseUrl)}/api/chat`;

  const body: OllamaRequest = {
    model: config.model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false,
    format: {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: ['code'],
    },
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, options);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Ollama API error ${response.status}: ${errorBody}`);
  }

  const data: OllamaResponse = await response.json();
  const content = data.message.content;
  try {
    const parsed = JSON.parse(content);
    return {
      role: data.message.role as 'user' | 'assistant',
      content: parsed.code ?? content,
    };
  } catch {
    return {
      role: data.message.role as 'user' | 'assistant',
      content,
    };
  }
}

// ==================== OpenAI 兼容（DeepSeek, Groq 等） ====================

async function chatOpenAI(
  config: ApiConfig,
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatMessage> {
  const url = `${stripTrailingSlash(config.baseUrl)}/chat/completions`;

  const body: OpenAIRequest = {
    model: config.model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: 4096,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }, options);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  const data: OpenAIResponse = await response.json();
  return {
    role: data.choices[0]?.message.role as 'user' | 'assistant',
    content: data.choices[0]?.message.content ?? '',
  };
}

// ==================== Claude (Anthropic Messages API) ====================

async function chatClaude(
  config: ApiConfig,
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatMessage> {
  const url = `${stripTrailingSlash(config.baseUrl)}/messages`;

  const body: ClaudeRequest = {
    model: config.model,
    max_tokens: 4096,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  }, options);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data: ClaudeResponse = await response.json();
  const textContent = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('');

  return {
    role: 'assistant',
    content: textContent,
  };
}

// ==================== 连接测试 ====================

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export async function testConnection(config: ApiConfig): Promise<TestConnectionResult> {
  try {
    const result = await chat(
      config,
      [{ role: 'user', content: 'hi' }],
      { timeout: 15000 },
    );
    return {
      success: true,
      message: `连接成功！模型 "${config.model}" 已就绪。`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: msg,
    };
  }
}

// ==================== 工具函数 ====================

/** 去除 URL 末尾的斜杠，避免拼接后出现双斜杠 */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** 带超时的 fetch */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  options?: ChatOptions,
): Promise<Response> {
  const timeout = options?.timeout ?? 30000;
  const controller = new AbortController();
  const signal = options?.signal;

  // 如果外部传了 signal，确保取消时传递
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new Error(`请求超时（${timeout / 1000} 秒）`);
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`网络连接失败：无法访问 ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
