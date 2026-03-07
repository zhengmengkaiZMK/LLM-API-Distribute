import React, { useContext } from 'react';
import { Typography, Divider } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const BaseURL = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>API Base URL 地址</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          所有 API 请求的基础地址配置说明。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>Base URL</Title>
        <Paragraph className="mt-2 mb-4">
          所有 API 请求都需要使用以下 Base URL：
        </Paragraph>
        <CodeBlock code={serverAddress} language="text" title="Base URL" />
      </section>

      <section>
        <Title heading={3}>兼容端点</Title>
        <Paragraph className="mt-2 mb-4">
          支持以下标准端点：
        </Paragraph>
        <div className="space-y-2">
          {[
            { endpoint: '/v1/chat/completions', desc: 'OpenAI 兼容对话接口' },
            { endpoint: '/v1/models', desc: '列出可用模型' },
            { endpoint: '/v1/images/generations', desc: '图像生成' },
            { endpoint: '/v1/embeddings', desc: '文本向量化' },
            { endpoint: '/v1/audio/speech', desc: '语音合成' },
            { endpoint: '/v1/audio/transcriptions', desc: '语音识别' },
            { endpoint: '/v1/responses', desc: 'Responses API（新）' },
            { endpoint: '/v1/messages', desc: 'Anthropic 原生接口' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
              <code className="text-semi-color-primary font-mono text-sm font-semibold min-w-[260px]">{item.endpoint}</code>
              <Text className="text-semi-color-text-2">{item.desc}</Text>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Title heading={3}>使用示例</Title>
        <CodeBlock
          code={`curl ${serverAddress}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
          language="bash"
          title="cURL"
        />
      </section>

      <InfoCard type="info" title="提示">
        如果您使用的是 OpenAI SDK，只需将 <code>base_url</code> 参数设置为上述地址即可，无需修改其他代码。
      </InfoCard>
    </div>
  );
};

export default BaseURL;
