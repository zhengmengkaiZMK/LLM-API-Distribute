import React from 'react';
import { Typography, Table, Tag, Divider } from '@douyinfe/semi-ui';
import { IconLink, IconTickCircle } from '@douyinfe/semi-icons';
import InfoCard from '../components/InfoCard';

const { Title, Paragraph, Text } = Typography;

const GettingStarted = () => {
  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>(必读)使用说明</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          API使用文档，帮助您快速接入和使用API服务。
        </Paragraph>
      </div>

      <Divider />

      {/* 简介 */}
      <section>
        <Title heading={3}>简介</Title>
        <Paragraph className="mt-2">
          问问API支持所有原厂主流大模型，比如：OpenAI, Anthropic, Gemini, Grok, Deepseek, Doubao, Qwen, 等等。
        </Paragraph>
        <Paragraph>
          所有模型可以在模型广场查看：
          <a href="/pricing" className="text-semi-color-primary ml-1" target="_blank" rel="noopener noreferrer">
            模型广场
          </a>
        </Paragraph>
      </section>

      {/* 快速指引 */}
      <section>
        <Title heading={3}>1. 快速指引</Title>
        <Paragraph className="mt-2 mb-4">按以下步骤可快速接入API：</Paragraph>

        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-8 h-8 rounded-full bg-semi-color-primary flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
            <div>
              <Text strong className="text-base">访问官网进行注册/登录</Text>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="blue" size="small">海外</Tag>
                  <Text>海外主站（CF 集群，高防，国外快）</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="green" size="small">国内</Tag>
                  <Text>国内主站（高质专线，国内服务器优先使用）</Text>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-8 h-8 rounded-full bg-semi-color-primary flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
            <div>
              <Text strong className="text-base">进入控制台</Text>
              <Paragraph className="mt-1 text-semi-color-text-2">
                登录后点击导航栏的「控制台」进入管理界面
              </Paragraph>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-8 h-8 rounded-full bg-semi-color-primary flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
            <div>
              <Text strong className="text-base">获取令牌</Text>
              <Paragraph className="mt-1 text-semi-color-text-2">
                在控制台的「令牌管理」中创建您的API Key
              </Paragraph>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
            <div className="w-8 h-8 rounded-full bg-semi-color-primary flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
            <div>
              <Text strong className="text-base">调用API接口</Text>
              <Paragraph className="mt-1 text-semi-color-text-2">
                参考本文档中的接口说明进行调用
              </Paragraph>
            </div>
          </div>
        </div>
      </section>

      {/* 控制台功能 */}
      <section>
        <Title heading={3}>2. 控制台功能详解</Title>
        <Paragraph className="mt-2 mb-4">
          登录后点击导航栏的「控制台」，可进入控制台，下面分别说明控制台各项功能：
        </Paragraph>

        <div className="space-y-6">
          <div>
            <Title heading={5}>2.1 操练场</Title>
            <Paragraph>
              从控制台进入「操练场」，可以选择各种大模型进行对话、生图。
              如果提示没有可用的令牌，请参考 2.4 令牌管理先添加个人令牌。
            </Paragraph>
          </div>

          <div>
            <Title heading={5}>2.2 聊天</Title>
            <Paragraph>
              从控制台进入「聊天」，在 MJ & NextWeb 中也可以选择大模型进行对话、生图等操作，MJ 也可以在这里使用。
            </Paragraph>
            <InfoCard type="info" title="设置服务端地址">
              点击左下角设置按钮，填写 OpenAI 接口地址和 API KEY。点击模型后可以进行模型切换，
              一定要选择「从服务端获取」，在弹出的窗口里选择需要的模型即可。
            </InfoCard>
          </div>

          <div>
            <Title heading={5}>2.3 数据看板</Title>
            <Paragraph>
              从控制台进入「数据看板」，可以查看账号状态、账号余额、数据统计、服务可用性等。
            </Paragraph>
          </div>

          <div>
            <Title heading={5}>2.4 令牌管理</Title>
            <Paragraph>
              从控制台进入「令牌管理」，可以在这里添加、编辑、复制您自己的令牌。
            </Paragraph>
            <InfoCard type="warning" title="注意">
              <ul className="list-disc pl-4 space-y-1">
                <li>令牌的额度并非账号的金额，而是对这个令牌可使用金额做的限制</li>
                <li>如果令牌限额达到，即便账号还有余额，该令牌也无法使用</li>
                <li>如果不需要限制，可以直接选择设为无限额度</li>
                <li>额度输入单位是积分值，1美金=500000积分</li>
              </ul>
            </InfoCard>
          </div>

          <div>
            <Title heading={5}>2.5 使用日志</Title>
            <Paragraph>
              从控制台进入「使用日志」，可以查看详细的大模型调用记录，可以按日期筛选。
            </Paragraph>
          </div>

          <div>
            <Title heading={5}>2.6 绘图日志</Title>
            <Paragraph>
              从控制台进入「绘图日志」，可以在此查看 MJ 绘图的使用记录。
            </Paragraph>
          </div>

          <div>
            <Title heading={5}>2.7 钱包</Title>
            <Paragraph>
              从控制台进入「钱包」，可以对账号进行在线充值。
            </Paragraph>
          </div>

          <div>
            <Title heading={5}>2.8 个人设置</Title>
            <Paragraph>
              从控制台进入「个人设置」，可以查看账号信息，并对账号进行设置。
            </Paragraph>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <Title heading={3}>3. FAQ (常见问题)</Title>
        <div className="mt-4 space-y-4">
          {[
            { q: '有示例代码吗？', a: '有的，具体请参考接口文档中的代码示例。' },
            { q: '有哪些模型可用？', a: '在网站页面上方导航栏点击「模型广场」，即可查看所有可用模型及价格。' },
            { q: '大模型使用价格？', a: '在网站页面上方导航栏点击「模型广场」，即可查看所有可用模型及价格。' },
            { q: '如何添加令牌？', a: '进入控制台 → 令牌管理可添加令牌，具体请参考第 2.4 节。' },
            { q: '如何设置令牌额度？', a: '进入控制台 → 令牌管理可管理令牌额度，具体请参考第 2.4 节。' },
            { q: '如何查看账号余额？', a: '进入控制台 → 数据看板可查看账号信息。' },
            { q: '如何给账号充值？', a: '进入控制台 → 钱包，可以对账号进行在线充值。' },
            { q: '如何进行简单测试？', a: '进入控制台 → 操练场可进行不同模型对话测试。' },
            {
              q: '模型定价的倍率是什么意思？',
              a: '倍率是系统内部用来换算积分和金额的基础系数，不需要关注，只需要关心模型价格即可。模型价格中，"提示"代表输入大模型的 token（提示词）的收费价格，"补全"代表大模型输出的 token（输出文字或图片）的收费价格。',
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-semi-color-border bg-semi-color-bg-1">
              <div className="flex items-start gap-2">
                <Text strong className="text-semi-color-primary">Q:</Text>
                <Text strong>{faq.q}</Text>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <Text strong className="text-green-600">A:</Text>
                <Text className="text-semi-color-text-1">{faq.a}</Text>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GettingStarted;
