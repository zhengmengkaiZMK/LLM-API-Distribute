import React, { useContext } from 'react';
import { Typography, Divider, Table, Tag } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const OpenAIGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>OpenAI SDK 使用指南</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          使用 OpenAI SDK 调用各大模型的完整指南。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>概述</Title>
        <Paragraph className="mt-2">
          API 完全兼容 OpenAI 接口格式，您可以直接使用 OpenAI 官方 SDK 进行调用，
          只需修改 <code>base_url</code> 和 <code>api_key</code> 即可访问所有支持的模型。
        </Paragraph>
      </section>

      <section>
        <Title heading={3}>Python 示例</Title>
        <CodeBlock
          code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="${serverAddress}/v1"
)

# 基础对话
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`}
          language="python"
          title="Python"
        />
      </section>

      <section>
        <Title heading={3}>Node.js 示例</Title>
        <CodeBlock
          code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: '${serverAddress}/v1',
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();`}
          language="javascript"
          title="Node.js"
        />
      </section>

      <section>
        <Title heading={3}>cURL 示例</Title>
        <CodeBlock
          code={`curl ${serverAddress}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
          language="bash"
          title="cURL"
        />
      </section>

      <section>
        <Title heading={3}>支持的模型</Title>
        <Paragraph className="mt-2 mb-4">通过 OpenAI 兼容格式可调用以下模型系列：</Paragraph>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'GPT-4o / GPT-4o-mini',
            'GPT-5.4',
            'Claude Opus / Sonnet / Haiku',
            'Gemini Pro / Flash',
            'Grok',
            'DeepSeek',
            'Doubao (豆包)',
            'Qwen (通义千问)',
            '更多模型...',
          ].map((model, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border text-center">
              <Text className="text-sm">{model}</Text>
            </div>
          ))}
        </div>
      </section>

      <InfoCard type="info" title="提示">
        使用 OpenAI SDK 调用非 OpenAI 模型时，只需将 <code>model</code> 参数改为对应的模型名称即可，
        如 <code>claude-sonnet-4-5-20251022</code>、<code>gemini-2.5-flash</code> 等。
      </InfoCard>

      <section>
        <Title heading={3}>流式响应</Title>
        <CodeBlock
          code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="${serverAddress}/v1"
)

# 流式对话
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首关于AI的诗"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`}
          language="python"
          title="Python - 流式响应"
        />
      </section>
    </div>
  );
};

export default OpenAIGuide;
