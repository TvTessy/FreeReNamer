import { useState } from 'react';
import { IconPencil, IconTrash, IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getApiTypeLabel, type ApiConfig } from '@/lib/settings/ai-config';
import { testConnection } from '@/lib/ai-client';

interface ApiConfigItemProps {
  config: ApiConfig;
  onEdit: (config: ApiConfig) => void;
  onDelete: (id: string) => void;
}

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export function ApiConfigItem({ config, onEdit, onDelete }: ApiConfigItemProps) {
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMsg, setTestMsg] = useState('');

  const handleTest = async () => {
    setTestStatus('loading');
    setTestMsg('');
    const result = await testConnection(config);
    setTestStatus(result.success ? 'success' : 'error');
    setTestMsg(result.message);
  };

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{config.name || '未命名'}</span>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs">
              {getApiTypeLabel(config.type)}
            </span>
            {testStatus === 'success' && (
              <span className="text-green-500 text-xs">✅</span>
            )}
            {testStatus === 'error' && (
              <span className="text-red-500 text-xs" title={testMsg}>❌</span>
            )}
          </div>
          <div className="text-muted-foreground text-sm">
            {config.baseUrl} / {config.model}
          </div>
          {config.apiKey && (
            <div className="text-muted-foreground text-xs">密钥: {'*'.repeat(8)}</div>
          )}
          {testMsg && testStatus === 'error' && (
            <div className="text-red-400 text-xs max-w-xs truncate">{testMsg}</div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTest}
            disabled={testStatus === 'loading'}
            title="测试连接"
          >
            <IconPlayerPlay className="h-3 w-3 mr-1" />
            {testStatus === 'loading' ? '...' : '测试'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(config)}>
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(config.id)}>
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
