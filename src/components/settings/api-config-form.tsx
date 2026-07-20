import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ApiConfigSchema,
  getDefaultApiConfig,
  getApiTypeLabel,
  KNOWN_MODELS,
  type ApiConfig,
  type ApiConfigType,
} from '@/lib/settings/ai-config';
import { testConnection } from '@/lib/ai-client';

interface ApiConfigFormProps {
  defaultValues?: Partial<ApiConfig>;
  onSubmit: (values: ApiConfig) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

/** 各 provider 的 API 端点路径提示 */
const ENDPOINT_HINTS: Record<ApiConfigType, string> = {
  ollama: '/api/chat',
  claude: '/messages',
  openai: '/chat/completions',
  deepseek: '/chat/completions',
  groq: '/chat/completions',
  'openai-compatible': '/chat/completions',
};

export function ApiConfigForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}: ApiConfigFormProps) {
  const form = useForm<ApiConfig>({
    resolver: zodResolver(ApiConfigSchema),
    defaultValues: {
      ...getDefaultApiConfig(),
      ...defaultValues,
    },
  });

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testResult, setTestResult] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const currentType = (form.watch('type') as ApiConfigType) ?? 'ollama';
  const models = KNOWN_MODELS[currentType] ?? [];

  const handleTestConnection = async () => {
    const values = form.getValues();
    const valid = ApiConfigSchema.safeParse(values);
    if (!valid.success) {
      setTestStatus('error');
      setTestResult('请先填写完整的配置信息');
      return;
    }

    setTestStatus('loading');
    setTestResult('正在测试连接...');
    setShowDebug(false);

    const result = await testConnection(valid.data);
    setTestStatus(result.success ? 'success' : 'error');
    setTestResult(result.message);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 配置名称 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>配置名称</FormLabel>
              <FormControl>
                <Input placeholder="给我的 AI 取个名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* API 类型选择 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API 类型</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-2"
                >
                  {(['ollama', 'openai', 'deepseek', 'groq', 'claude', 'openai-compatible'] as const).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`} className="font-normal text-sm">
                        {getApiTypeLabel(type)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 服务器地址 */}
        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => {
            const placeholders: Record<ApiConfigType, string> = {
              ollama: 'http://localhost:11434',
              openai: 'https://api.openai.com/v1',
              deepseek: 'https://api.deepseek.com/v1',
              groq: 'https://api.groq.com/openai/v1',
              claude: 'https://api.anthropic.com/v1',
              'openai-compatible': 'http://localhost:8000/v1',
            };
            return (
              <FormItem>
                <FormLabel>服务器地址</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders[currentType]} {...field} />
                </FormControl>
                <FormDescription>
                  请求地址：{field.value || placeholders[currentType]}{ENDPOINT_HINTS[currentType]}
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* 模型名称（下拉 + 手动输入） */}
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => {
            const placeholders: Record<ApiConfigType, string> = {
              ollama: 'llama3.2',
              openai: 'gpt-4o-mini',
              deepseek: 'deepseek-chat',
              groq: 'mixtral-8x7b-32768',
              claude: 'claude-3-5-sonnet-20241022',
              'openai-compatible': 'your-model-name',
            };
            const placeholder = placeholders[currentType];

            return (
              <FormItem>
                <FormLabel>模型名称</FormLabel>
                {models.length > 0 ? (
                  <div className="space-y-2">
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        // 触发表单验证
                        form.trigger('model');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">✏️ 手动输入...</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === '__custom__' && (
                      <FormControl>
                        <Input
                          placeholder={`输入模型名称，如 ${placeholder}`}
                          value=""
                          onChange={(e) => field.onChange(e.target.value)}
                          autoFocus
                        />
                      </FormControl>
                    )}
                    {field.value && field.value !== '__custom__' && (
                      <p className="text-xs text-muted-foreground">
                        当前：{field.value}
                      </p>
                    )}
                  </div>
                ) : (
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* API Key（非 Ollama 显示） */}
        {currentType !== 'ollama' && (
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => {
              const keyLabels: Record<ApiConfigType, string> = {
                ollama: 'API Key',
                openai: 'OpenAI API Key',
                deepseek: 'Deepseek API Key',
                groq: 'Groq API Key',
                claude: 'Claude API Key',
                'openai-compatible': 'API Key（可选）',
              };
              return (
                <FormItem>
                  <FormLabel>{keyLabels[currentType]}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-xxxxx..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        {/* 测试连接按钮 */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testStatus === 'loading'}
            >
              {testStatus === 'loading' ? '⏳ 测试中...' : '🔍 测试连接'}
            </Button>
            {testStatus === 'success' && (
              <span className="text-sm text-green-500">✅ {testResult}</span>
            )}
            {testStatus === 'error' && testResult && (
              <span className="text-sm text-red-500">
                ❌ 连接失败
                <button
                  type="button"
                  className="ml-2 underline text-xs"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  查看详情
                </button>
              </span>
            )}
          </div>
          {showDebug && testStatus === 'error' && (
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {testResult}
            </pre>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
