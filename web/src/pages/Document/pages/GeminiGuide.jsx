import React, { useContext } from 'react';
import { Typography, Divider, Table, Tag } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const GeminiGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>Gemini SDK 使用指南</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          使用 Google 官方 Gemini 原生格式进行 API 调用的完整指南。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>概述</Title>
        <Paragraph className="mt-2">
          支持直接使用 Gemini 官方原生格式进行请求，无需代码转换。无缝兼容现有的 Gemini 代码，
          可直接使用 Google 官方 SDK。
        </Paragraph>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {[
            { title: '无缝兼容', desc: '保留官方请求和响应结构' },
            { title: '功能完整', desc: '支持多模态、Function Calling、代码执行等' },
            { title: '推理能力', desc: '完整支持 Gemini 2.5 系列思维链推理' },
            { title: '便捷迁移', desc: '现有项目可快速切换至服务' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
              <Text strong className="text-semi-color-primary text-sm">{item.title}</Text>
              <Paragraph className="text-xs text-semi-color-text-2 mt-1 mb-0">{item.desc}</Paragraph>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Title heading={3}>环境准备</Title>
        <Paragraph className="mt-2">
          推荐使用 Google 官方的最新 <code>google-genai</code> Python SDK（统一 Gen AI SDK）。
        </Paragraph>
        <CodeBlock
          code="pip install google-genai"
          language="bash"
          title="安装 SDK"
        />
        <InfoCard type="warning" title="注意">
          旧版 <code>google-generative-ai</code> 已停止支持（2025年11月30日），请使用新版 <code>google-genai</code>。
        </InfoCard>
      </section>

      <section>
        <Title heading={3}>基础文本生成</Title>
        <CodeBlock
          code={`from google import genai

client = genai.Client(
    api_key="sk-your-api-key",
    http_options={"api_version": "v1beta", "url": "${serverAddress}"}
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in simple terms"
)

print(response.text)`}
          language="python"
          title="Python - 基础用法"
        />
      </section>

      <section>
        <Title heading={3}>Gemini 2.5 系列推理功能</Title>
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="blue">混合推理</Tag>
              <Text strong>gemini-2.5-flash</Text>
            </div>
            <Text className="text-semi-color-text-2 text-sm">
              支持通过 <code>thinking_budget</code> 参数调整推理深度（范围：0-16384 tokens）
            </Text>
          </div>
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="green">纯推理</Tag>
              <Text strong>gemini-2.5-pro</Text>
            </div>
            <Text className="text-semi-color-text-2 text-sm">
              自动启用思维链推理，无法关闭。设置 <code>include_thoughts=True</code> 可查看思考过程。
            </Text>
          </div>
        </div>
      </section>

      <section>
        <Title heading={3}>核心功能</Title>
        <div className="space-y-3 mt-4">
          {[
            { title: '多模态处理', desc: '支持图片、视频、音频处理和分析' },
            { title: '代码执行', desc: '模型支持自动执行 Python 代码，适用于数据分析场景（沙箱环境）' },
            { title: 'Function Calling', desc: '支持定义工具，让模型调用外部功能' },
            { title: '上下文缓存', desc: '系统自动启用隐式缓存，缓存的 Tokens 按正常价格的 25% 计费' },
            { title: 'Tokens 用量追踪', desc: '每次调用返回详细的 Tokens 用量信息' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
              <Text strong className="text-semi-color-primary min-w-[120px]">{item.title}</Text>
              <Text className="text-semi-color-text-2 text-sm">{item.desc}</Text>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Title heading={3}>与 OpenAI 兼容格式对比</Title>
        <Table
          dataSource={[
            { key: '1', feature: '端点', gemini: serverAddress, openai: `${serverAddress}/v1/chat/completions` },
            { key: '2', feature: 'SDK', gemini: 'google-genai', openai: 'openai' },
            { key: '3', feature: '推理控制', gemini: 'thinking_budget (0-16384)', openai: 'reasoning_effort (low/medium/high)' },
            { key: '4', feature: '思考过程', gemini: 'include_thoughts=True', openai: '不支持' },
            { key: '5', feature: '代码执行', gemini: "tools=[{'code_execution': {}}]", openai: '不支持' },
            { key: '6', feature: '缓存检测', gemini: 'cached_content_token_count', openai: '无详细字段' },
          ]}
          columns={[
            { title: '特性', dataIndex: 'feature', width: 100 },
            { title: 'Gemini 原生格式', dataIndex: 'gemini' },
            { title: 'OpenAI 兼容格式', dataIndex: 'openai' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      <InfoCard type="info" title="重要限制">
        <ul className="list-disc pl-4 space-y-1">
          <li>媒体文件大小不能超过 20MB</li>
          <li>代码执行仅限 Python 沙箱环境</li>
          <li>推理 tokens 会增加输出成本，请合理设置 thinking_budget</li>
        </ul>
      </InfoCard>
    </div>
  );
};

export default GeminiGuide;
