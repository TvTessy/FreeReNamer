import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApiConfigSchema, getDefaultApiConfig, getApiTypeLabel, type ApiConfig, type ApiConfigType } from '@/lib/settings/ai-config';

interface ApiConfigFormProps {
  defaultValues?: Partial<ApiConfig>;
  onSubmit: (values: ApiConfig) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>配置名称</FormLabel>
              <FormControl>
                <Input placeholder="给我的Ollama取个名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API类型</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  {(['ollama', 'openai', 'deepseek', 'groq', 'claude', 'openai-compatible'] as const).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="font-normal">
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

        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => {
            const type = form.watch('type') as ApiConfigType;
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
                  <Input placeholder={placeholders[type]} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => {
            const type = form.watch('type') as ApiConfigType;
            const placeholders: Record<ApiConfigType, string> = {
              ollama: 'llama3.2',
              openai: 'gpt-4o-mini',
              deepseek: 'deepseek-chat',
              groq: 'mixtral-8x7b-32768',
              claude: 'claude-3-5-sonnet-20241022',
              'openai-compatible': 'your-model-name',
            };
            return (
              <FormItem>
                <FormLabel>模型名称</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders[type]} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {form.watch('type') !== 'ollama' && (
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => {
              const type = form.watch('type') as ApiConfigType;
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
                  <FormLabel>{keyLabels[type]}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="sk-xxxxx..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

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
