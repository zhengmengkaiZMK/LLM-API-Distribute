import React, { useState } from 'react';
import { Button, Toast } from '@douyinfe/semi-ui';
import { IconCopy, IconTick } from '@douyinfe/semi-icons';

const CodeBlock = ({ code, language = 'bash', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Toast.error('复制失败');
    }
  };

  return (
    <div className="rounded-lg border border-semi-color-border overflow-hidden my-4 bg-semi-color-bg-2">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-semi-color-fill-0 border-b border-semi-color-border">
          <span className="text-xs text-semi-color-text-2 font-mono">{title || language}</span>
          <Button
            size="small"
            type="tertiary"
            icon={copied ? <IconTick /> : <IconCopy />}
            onClick={handleCopy}
            className="!text-xs"
          >
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-semi-color-text-0 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
