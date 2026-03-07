import React, { useContext } from 'react';
import { Typography, Divider } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const OpenClawGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>OpenClaw 接入 APIPro</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          将 OpenClaw 工具接入 API 服务的详细步骤指南。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>第一步：获取 API Key</Title>
        <div className="space-y-3 mt-4">
          <div className="flex gap-3 items-start p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-6 h-6 rounded-full bg-semi-color-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
            <Text>注册账号并登录</Text>
          </div>
          <div className="flex gap-3 items-start p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-6 h-6 rounded-full bg-semi-color-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
            <Text>进入控制台 → 令牌管理，创建一个 API Key</Text>
          </div>
          <div className="flex gap-3 items-start p-3 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-6 h-6 rounded-full bg-semi-color-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
            <div>
              <Text>记下您的 API Key 和 Base URL：</Text>
              <code className="ml-2 text-semi-color-primary">{serverAddress}/v1</code>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Title heading={3}>第二步：安装 OpenClaw</Title>
        <Paragraph className="mt-2">环境要求：Node.js 18+，推荐 Mac/Linux/WSL2。</Paragraph>
      </section>

      <section>
        <Title heading={3}>第三步：接入配置</Title>
        <Paragraph className="mt-2">
          在 OpenClaw 配置文件 <code>~/.openclaw/openclaw.json</code> 中添加以下配置。一个 Key 搞定大部分模型接入：
        </Paragraph>
        <CodeBlock
          code={`{
  "models": {
    "mode": "merge",
    "providers": {
      "api-proxy-claude": {
        "api": "anthropic-messages",
        "apiKey": "sk-xxxx",
        "baseUrl": "${serverAddress}",
        "models": [
          {
            "contextWindow": 200000,
            "id": "claude-sonnet-4-5-20250929",
            "maxTokens": 8192,
            "name": "Claude Sonnet 4.5",
            "headers": {
              "User-Agent": "Mozilla/5.0",
              "Content-Type": "application/json"
            }
          }
        ]
      },
      "api-proxy-google": {
        "api": "google-generative-ai",
        "baseUrl": "${serverAddress}/v1beta",
        "apiKey": "sk-xxxx",
        "models": [
          {
            "contextWindow": 2000000,
            "id": "gemini-3-pro-preview",
            "maxTokens": 8192,
            "name": "Gemini 3 Pro"
          }
        ]
      },
      "api-proxy-gpt": {
        "api": "openai-completions",
        "baseUrl": "${serverAddress}/v1",
        "apiKey": "sk-xxxx",
        "models": [
          {
            "contextWindow": 128000,
            "id": "gpt-4o",
            "maxTokens": 8192,
            "name": "GPT-4o"
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "api-proxy-gpt/gpt-4o"
      },
      "models": {
        "api-proxy-claude/claude-sonnet-4-5-20250929": {
          "alias": "Claude Sonnet 4.5"
        },
        "api-proxy-google/gemini-3-pro-preview": {
          "alias": "Gemini 3 Pro"
        },
        "api-proxy-gpt/gpt-4o": {
          "alias": "GPT-4o"
        }
      }
    }
  }
}`}
          language="json"
          title="~/.openclaw/openclaw.json"
        />
      </section>

      <section>
        <Title heading={3}>第四步：接入 IM（飞书）</Title>
        <Paragraph className="mt-2">
          配置完成后重启服务即可使用。
        </Paragraph>
      </section>

      <InfoCard type="success" title="配置完成">
        配置完成后，您可以在 OpenClaw 中使用 Claude、Gemini、GPT 等多种模型，
        只需一个 API Key 即可访问所有支持的大模型。
      </InfoCard>
    </div>
  );
};

export default OpenClawGuide;
