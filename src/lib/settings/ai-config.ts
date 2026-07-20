import { z } from 'zod';
import { nanoid } from 'nanoid';

export const API_CONFIG_TYPES = ['ollama', 'openai', 'deepseek', 'groq', 'claude', 'openai-compatible'] as const;
export type ApiConfigType = (typeof API_CONFIG_TYPES)[number];

export const ApiConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '配置名称不能为空'),
  type: z.enum(['ollama', 'openai', 'deepseek', 'groq', 'claude', 'openai-compatible']),
  baseUrl: z.string().url('请输入有效的URL'),
  model: z.string().min(1, '模型名称不能为空'),
  apiKey: z.string().optional(),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

const API_DEFAULTS: Record<ApiConfigType, Partial<ApiConfig>> = {
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKey: '',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'mixtral-8x7b-32768',
    apiKey: '',
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: '',
  },
  'openai-compatible': {
    baseUrl: 'http://localhost:8000/v1',
    model: 'your-model-name',
    apiKey: '',
  },
};

export function getDefaultApiConfig(type: ApiConfigType = 'ollama'): ApiConfig {
  const defaults = API_DEFAULTS[type];
  return {
    id: nanoid(),
    name: '',
    type,
    baseUrl: defaults?.baseUrl || 'http://localhost:11434',
    model: defaults?.model || 'model-name',
    apiKey: defaults?.apiKey,
  };
}

export function getApiTypeLabel(type: ApiConfigType): string {
  const labels: Record<ApiConfigType, string> = {
    ollama: 'Ollama',
    openai: 'OpenAI',
    deepseek: 'Deepseek',
    groq: 'Groq',
    claude: 'Claude',
    'openai-compatible': 'OpenAI 兼容',
  };
  return labels[type];
}

/** 各平台的已知可用模型，用于 UI 下拉选择 */
export const KNOWN_MODELS: Record<ApiConfigType, string[]> = {
  ollama: ['llama3.2', 'mistral', 'neural-chat', 'codellama', 'qwen2.5'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  groq: ['mixtral-8x7b-32768', 'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  'openai-compatible': [],
};
