import React, { useContext } from 'react';
import { Typography, Divider, Tag, Table } from '@douyinfe/semi-ui';
import APIEndpoint from '../components/APIEndpoint';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const OpenAIChat = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>聊天（Chat Completions）</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          基础文本对话接口，兼容 OpenAI Chat Completions API 格式。
          支持 OpenAI, Gemini, Claude, DeepSeek 等所有主流模型。
        </Paragraph>
      </div>

      <Divider />

      <APIEndpoint
        method="POST"
        path="/v1/chat/completions"
        description="创建一个聊天补全请求。"
        headers={[
          {
            key: '1',
            name: 'Authorization',
            type: 'string',
            required: true,
            description: 'Bearer Token 认证',
          },
          {
            key: '2',
            name: 'Content-Type',
            type: 'string',
            required: true,
            description: 'application/json',
          },
        ]}
        bodyParams={[
          { key: '1', name: 'model', type: 'string', required: true, description: '模型 ID，如 gpt-4o, claude-sonnet-4-5-20251022' },
          { key: '2', name: 'messages', type: 'array', required: true, description: '消息列表，包含 role 和 content' },
          { key: '3', name: 'temperature', type: 'number', required: false, description: '采样温度 (0-2)，默认 1' },
          { key: '4', name: 'max_tokens', type: 'integer', required: false, description: '最大输出 token 数' },
          { key: '5', name: 'stream', type: 'boolean', required: false, description: '是否流式返回，默认 false' },
          { key: '6', name: 'top_p', type: 'number', required: false, description: '核采样参数，默认 1' },
          { key: '7', name: 'frequency_penalty', type: 'number', required: false, description: '频率惩罚 (-2~2)，默认 0' },
          { key: '8', name: 'presence_penalty', type: 'number', required: false, description: '存在惩罚 (-2~2)，默认 0' },
        ]}
        curlExample={`curl ${serverAddress}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer {YOUR_API_KEY}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7
  }'`}
        responseExample={`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 9,
    "total_tokens": 29
  }
}`}
      />

      <InfoCard type="info" title="多模型兼容">
        该接口支持所有主流大模型，只需更改 <code>model</code> 参数即可切换：
        <div className="flex flex-wrap gap-2 mt-2">
          {['gpt-4o', 'gpt-4o-mini', 'claude-sonnet-4-5-20251022', 'gemini-2.5-flash', 'deepseek-chat', 'grok-3'].map((m) => (
            <Tag key={m} size="small" color="blue">{m}</Tag>
          ))}
        </div>
      </InfoCard>
    </div>
  );
};

export default OpenAIChat;
