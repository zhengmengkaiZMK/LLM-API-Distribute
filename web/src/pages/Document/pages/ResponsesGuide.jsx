import React, { useContext } from 'react';
import { Typography, Divider, Table, Tag } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const ResponsesGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>Responses API 接口使用指南</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          OpenAI 新一代智能体构建接口，结合了 Chat Completions 的简洁性与 Assistants API 的工具使用和状态管理能力。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>接口概述</Title>
        <Paragraph className="mt-2">
          Responses API 是 OpenAI 在 2025年3月推出的新一代智能体构建接口。它是 Chat Completions 的超集，
          在提供对话功能的同时，增加了内置工具、状态管理等高级特性。
        </Paragraph>
        <InfoCard type="info" title="适用端点">
          <code>/v1/responses</code> — 仅支持 GPT-4.1, O3 系列等新模型
        </InfoCard>
      </section>

      <section>
        <Title heading={3}>核心特性</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {[
            { title: '内置工具支持', desc: 'Web 搜索、文件搜索、代码解释器、函数调用' },
            { title: '状态管理', desc: '通过 previous_response_id 维护对话上下文' },
            { title: '推理保持', desc: 'O3/O4-mini 推理令牌跨请求保持连续' },
            { title: '完全兼容', desc: '支持所有 GPT-4.1、O3 系列模型' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
              <Text strong className="text-semi-color-primary">{item.title}</Text>
              <Paragraph className="mt-1 text-sm text-semi-color-text-2 mb-0">{item.desc}</Paragraph>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Title heading={3}>支持的模型</Title>
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="blue">推荐</Tag>
              <Text strong>推理模型</Text>
            </div>
            <Text className="text-semi-color-text-2">
              <code>o3</code>、<code>o3-pro</code>、<code>o4-mini</code> — 推理令牌跨请求保持，更智能的上下文理解
            </Text>
          </div>
          <div className="p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <Text strong>对话模型</Text>
            <br />
            <Text className="text-semi-color-text-2">
              <code>gpt-4.1</code>、<code>gpt-4.1-mini</code> — 强大的工具调用和多模态能力
            </Text>
          </div>
        </div>
      </section>

      <section>
        <Title heading={3}>基础用法</Title>
        <CodeBlock
          code={`curl ${serverAddress}/v1/responses \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4.1",
    "input": "Hello! How can you help me today?",
    "instructions": "You are a helpful assistant."
  }'`}
          language="bash"
          title="cURL"
        />
        <CodeBlock
          code={`{
  "id": "resp_6884fcab4930819dbbc02f15cbe63f6c",
  "object": "response",
  "created_at": 1753545899,
  "status": "completed",
  "model": "gpt-4.1-2025-04-14",
  "output": [
    {
      "id": "msg_6884fcab8f18819dbcdf349f01b424f8",
      "type": "message",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Hello! How can I assist you today?"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 19,
    "output_tokens": 10,
    "total_tokens": 29
  }
}`}
          language="json"
          title="Response"
        />
      </section>

      <section>
        <Title heading={3}>请求参数</Title>
        <Table
          dataSource={[
            { key: '1', name: 'model', type: 'string', required: true, description: '模型名称，如 gpt-4.1, o3' },
            { key: '2', name: 'input', type: 'string', required: true, description: '用户输入内容' },
            { key: '3', name: 'instructions', type: 'string', required: false, description: '系统指令，定义助手行为' },
            { key: '4', name: 'previous_response_id', type: 'string', required: false, description: '上一个响应的 ID，用于维护上下文' },
            { key: '5', name: 'temperature', type: 'float', required: false, description: '控制输出随机性 (0-2)，默认 1.0' },
            { key: '6', name: 'max_output_tokens', type: 'int', required: false, description: '最大输出令牌数' },
            { key: '7', name: 'tools', type: 'array', required: false, description: '可用工具列表' },
            { key: '8', name: 'tool_choice', type: 'string', required: false, description: '工具选择策略，默认 "auto"' },
            { key: '9', name: 'store', type: 'boolean', required: false, description: '是否存储对话，默认 true' },
          ]}
          columns={[
            { title: '参数名', dataIndex: 'name', render: (text) => <code className="text-semi-color-primary">{text}</code> },
            { title: '类型', dataIndex: 'type' },
            { title: '必填', dataIndex: 'required', render: (val) => val ? <Tag color="red" size="small">必填</Tag> : <Tag size="small">可选</Tag> },
            { title: '说明', dataIndex: 'description' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      <section>
        <Title heading={3}>与 Chat Completions API 对比</Title>
        <Table
          dataSource={[
            { key: '1', feature: '基础对话', chat: '✅ 支持', responses: '✅ 支持' },
            { key: '2', feature: '流式响应', chat: '✅ 支持', responses: '✅ 支持' },
            { key: '3', feature: '函数调用', chat: '✅ 支持', responses: '✅ 增强支持' },
            { key: '4', feature: '内置工具', chat: '❌ 不支持', responses: '✅ 丰富工具' },
            { key: '5', feature: '状态管理', chat: '❌ 无状态', responses: '✅ 有状态' },
            { key: '6', feature: '推理保持', chat: '❌ 不支持', responses: '✅ O3/O4 支持' },
            { key: '7', feature: '文件搜索', chat: '❌ 不支持', responses: '✅ 支持' },
          ]}
          columns={[
            { title: '特性', dataIndex: 'feature', width: 120 },
            { title: 'Chat Completions', dataIndex: 'chat' },
            { title: 'Responses API', dataIndex: 'responses' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      <section>
        <Title heading={3}>错误处理</Title>
        <CodeBlock
          code={`{
  "error": {
    "type": "invalid_request_error",
    "code": "model_not_supported",
    "message": "The model 'gpt-3.5-turbo' is not supported for the responses endpoint.",
    "param": "model"
  }
}`}
          language="json"
          title="错误响应示例"
        />
        <Paragraph className="mt-4">常见错误码：</Paragraph>
        <ul className="list-disc pl-6 space-y-1 text-semi-color-text-1">
          <li><code>model_not_supported</code>：模型不支持 Responses API — 请使用支持的新模型</li>
          <li><code>invalid_previous_response_id</code>：无效的上一个响应 ID</li>
          <li><code>max_tokens_exceeded</code>：超出令牌限制</li>
        </ul>
      </section>
    </div>
  );
};

export default ResponsesGuide;
