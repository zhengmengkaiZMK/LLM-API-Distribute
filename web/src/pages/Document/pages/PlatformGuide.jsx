import React from 'react';
import { Typography, Divider, Card } from '@douyinfe/semi-ui';
import { IconLink } from '@douyinfe/semi-icons';

const { Title, Paragraph, Text } = Typography;

const guides = [
  {
    title: '1. 接入 Claude Code 指南',
    description: '了解如何在 Claude Code 中配置和使用 API 服务',
    link: 'https://ai.feishu.cn/wiki/ZeF5wt0eCi5uSikEPgBce1pGntb',
  },
  {
    title: '2. Mac 系统接入 CodeX',
    description: '在 macOS 系统上配置 OpenAI CodeX 使用 API 服务',
    link: 'https://ai.feishu.cn/wiki/DWwmwp12Ki23BUkeTGHcXTQpndq',
  },
  {
    title: '3. Windows 系统接入 CodeX',
    description: '在 Windows 系统上配置 OpenAI CodeX 使用 API 服务',
    link: 'https://ai.feishu.cn/wiki/C0mzwcFwiiW2jMkRW8WcRTfunTg',
  },
  {
    title: '4. 接入 VSCode 指南',
    description: '在 Visual Studio Code 中配置 API 接入使用',
    link: 'https://ai.feishu.cn/wiki/FcR9wtUOaixSRgkGS42c1utjnB8',
  },
  {
    title: '5. 在 Claude Code 中使用 Gemini 模型',
    description: '配置 Claude Code 使用 Gemini 模型的详细教程',
    link: 'https://my.feishu.cn/wiki/OSd0wtiNlifRSMkXVwwctQiunih',
  },
];

const PlatformGuide = () => {
  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>接入各编程平台指南</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          各种开发工具和 IDE 的接入配置指南。
        </Paragraph>
      </div>

      <Divider />

      <div className="grid gap-4">
        {guides.map((guide, idx) => (
          <a
            key={idx}
            href={guide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline"
          >
            <div className="p-5 rounded-lg border border-semi-color-border bg-semi-color-bg-1 hover:bg-semi-color-fill-0 hover:border-semi-color-primary transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="text-base text-semi-color-text-0 group-hover:text-semi-color-primary">
                    {guide.title}
                  </Text>
                  <Paragraph className="mt-1 text-semi-color-text-2 text-sm mb-0">
                    {guide.description}
                  </Paragraph>
                </div>
                <IconLink className="text-semi-color-text-3 group-hover:text-semi-color-primary flex-shrink-0" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PlatformGuide;
