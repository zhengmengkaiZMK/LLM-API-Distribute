import React, { useContext } from 'react';
import { Typography, Divider, Table, Tag } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const AnthropicGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>Anthropic SDK 使用指南</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          使用 OpenAI 兼容格式和 Anthropic 原生格式调用 Claude 模型的完整指南。
        </Paragraph>
      </div>

      <Divider />

      {/* OpenAI 兼容格式 */}
      <section>
        <Title heading={3}>1. OpenAI 兼容格式调用</Title>
        <Paragraph className="mt-2">
          支持标准的 OpenAI SDK 调用 Claude 模型，只需修改 <code>base_url</code> 和 <code>model</code> 参数即可。
        </Paragraph>
        <CodeBlock
          code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="${serverAddress}/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20251022",
    messages=[
        {"role": "user", "content": "Hello Claude!"}
    ]
)

print(response.choices[0].message.content)`}
          language="python"
          title="Python - OpenAI 格式"
        />
      </section>

      {/* Anthropic 原生格式 */}
      <section>
        <Title heading={3}>2. Anthropic 原生格式调用</Title>
        <Paragraph className="mt-2">
          完整支持 Anthropic 官方 SDK 的原生 <code>/messages</code> 端点，无需任何转换。
        </Paragraph>
        <CodeBlock
          code={`import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-api-key",
    base_url="${serverAddress}"
)

message = client.messages.create(
    model="claude-sonnet-4-5-20251022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello Claude!"}
    ]
)

print(message.content[0].text)`}
          language="python"
          title="Python - Anthropic 原生格式"
        />
      </section>

      {/* Claude Code 配置 */}
      <section>
        <Title heading={3}>3. Claude Code 桌面应用配置</Title>
        <Paragraph className="mt-2">
          Claude Code 是 Anthropic 官方推出的 AI 编程助手桌面应用，API 完美支持在 Claude Code 中使用。
        </Paragraph>

        <div className="space-y-3 mt-4">
          {[
            '打开 Claude Code 设置，点击右上角齿轮图标，选择「Settings」',
            '在「API Key」字段输入您的 API 密钥（格式：sk-xxxxxxxxxxxxxxxx）',
            `在「Custom API Endpoint」字段输入：${serverAddress}`,
            '选择模型：claude-opus-4-5-20251101（最强）/ claude-sonnet-4-5-20251022（平衡）',
            '点击「Save」保存配置',
          ].map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
              <div className="w-6 h-6 rounded-full bg-semi-color-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <Text>{step}</Text>
            </div>
          ))}
        </div>

        <CodeBlock
          code={`{
  "model": "claude-opus-4-5-20251101",
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "baseURL": "${serverAddress}",
  "maxTokens": 8192,
  "temperature": 0.7
}`}
          language="json"
          title="配置示例"
        />
      </section>

      {/* 推理深度控制 */}
      <section>
        <Title heading={3}>4. 推理深度控制（Opus 4.5 专属）</Title>
        <Paragraph className="mt-2">
          Claude Opus 4.5 引入了全新的 <code>effort</code> 参数，可调节推理深度。
        </Paragraph>
        <Table
          dataSource={[
            { key: '1', mode: 'low', desc: '快速响应，推理深度较浅', scenario: '简单问答、快速原型', cost: '低' },
            { key: '2', mode: 'medium', desc: '平衡质量与速度（默认）', scenario: '大多数编程任务', cost: '中等（比 high 节省 76%）' },
            { key: '3', mode: 'high', desc: '深度推理，质量最高', scenario: '复杂架构设计、难题分析', cost: '高' },
          ]}
          columns={[
            { title: '模式', dataIndex: 'mode', render: (t) => <Tag color="blue">{t}</Tag> },
            { title: '说明', dataIndex: 'desc' },
            { title: '适用场景', dataIndex: 'scenario' },
            { title: 'Token 消耗', dataIndex: 'cost' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
        <InfoCard type="warning" title="注意">
          <code>effort</code> 参数仅适用于 Claude Opus 4.5，其他模型（Sonnet/Haiku）不支持此功能。
        </InfoCard>
      </section>

      {/* 技术规格 */}
      <section>
        <Title heading={3}>5. 技术规格对比</Title>
        <Table
          dataSource={[
            { key: '1', param: '上下文长度', opus: '200,000 tokens', sonnet: '200,000 tokens', haiku: '200,000 tokens' },
            { key: '2', param: '最大输出', opus: '64,000 tokens', sonnet: '8,192 tokens', haiku: '8,192 tokens' },
            { key: '3', param: '多模态', opus: '✅ 图像输入', sonnet: '✅ 图像输入', haiku: '✅ 图像输入' },
            { key: '4', param: '推理控制', opus: '✅ effort 参数', sonnet: '❌', haiku: '❌' },
          ]}
          columns={[
            { title: '参数', dataIndex: 'param', width: 120 },
            { title: 'Opus 4.5', dataIndex: 'opus' },
            { title: 'Sonnet 4.5', dataIndex: 'sonnet' },
            { title: 'Haiku 4.5', dataIndex: 'haiku' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      {/* 最佳实践 */}
      <section>
        <Title heading={3}>6. 最佳实践</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <Text strong className="text-semi-color-primary">复杂编程任务</Text>
            <Paragraph className="text-sm text-semi-color-text-2 mt-1 mb-0">
              使用 claude-opus-4-5 + high/medium 模式
            </Paragraph>
          </div>
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <Text strong className="text-semi-color-primary">日常代码生成</Text>
            <Paragraph className="text-sm text-semi-color-text-2 mt-1 mb-0">
              使用 claude-sonnet-4-5，性价比最高
            </Paragraph>
          </div>
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <Text strong className="text-semi-color-primary">快速问答/高并发</Text>
            <Paragraph className="text-sm text-semi-color-text-2 mt-1 mb-0">
              使用 claude-haiku-4-5，速度快成本低
            </Paragraph>
          </div>
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <Text strong className="text-semi-color-primary">多模态任务</Text>
            <Paragraph className="text-sm text-semi-color-text-2 mt-1 mb-0">
              优先选择 Opus 或 Sonnet，视觉理解更强
            </Paragraph>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnthropicGuide;
