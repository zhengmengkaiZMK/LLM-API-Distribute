import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Collapsible, Tag } from '@douyinfe/semi-ui';
import {
  IconChevronRight,
  IconChevronDown,
  IconHome,
  IconLink,
  IconCode,
  IconList,
  IconArticle,
  IconSearch,
} from '@douyinfe/semi-icons';
import { useIsMobile } from '../../hooks/common/useIsMobile';

import GettingStarted from './pages/GettingStarted';
import BaseURL from './pages/BaseURL';
import PlatformGuide from './pages/PlatformGuide';
import OpenAIGuide from './pages/OpenAIGuide';
import ResponsesGuide from './pages/ResponsesGuide';
import ModelsAPI from './pages/ModelsAPI';
import OpenAIChat from './pages/OpenAIChat';
import AnthropicGuide from './pages/AnthropicGuide';
import GeminiGuide from './pages/GeminiGuide';
import VideoParams from './pages/VideoParams';
import MidjourneyGuide from './pages/MidjourneyGuide';
import OpenClawGuide from './pages/OpenClawGuide';

const { Title, Text, Paragraph } = Typography;

// 侧边栏导航数据
const sidebarData = [
  {
    title: '基础说明',
    items: [
      { key: 'getting-started', label: '(必读)使用说明', icon: <IconArticle size="small" /> },
      { key: 'base-url', label: 'API Base URL地址', icon: <IconLink size="small" /> },
      { key: 'platform-guide', label: '接入各编程平台指南', icon: <IconCode size="small" /> },
    ],
  },
  {
    title: '列出模型',
    items: [
      { key: 'models', label: 'Models（列出模型）', icon: <IconList size="small" />, method: 'GET' },
    ],
  },
  {
    title: 'OpenAI 接口',
    subtitle: '兼容各大原厂模型',
    items: [
      { key: 'openai-guide', label: 'OpenAI SDK使用指南', icon: <IconArticle size="small" /> },
      { key: 'responses-guide', label: 'Responses API 接口使用指南', icon: <IconArticle size="small" /> },
    ],
    subGroups: [
      {
        title: '对话',
        subtitle: 'openai, gemini, claude, deepseek...',
        items: [
          { key: 'openai-chat', label: '聊天', method: 'POST' },
          { key: 'openai-stream', label: '流式返回', method: 'POST' },
          { key: 'openai-thinking', label: '思考模式', method: 'POST' },
          { key: 'openai-structured', label: '结构化输出', method: 'POST' },
          { key: 'openai-tools', label: '工具调用', method: 'POST' },
          { key: 'openai-mcp', label: 'MCP调用', method: 'POST' },
          { key: 'openai-search', label: '联网搜索', method: 'POST' },
        ],
      },
      {
        title: '图像',
        subtitle: 'gpt, dalle, banana, jimeng, doubao',
        items: [
          { key: 'openai-txt2img', label: '文生图', method: 'POST' },
          { key: 'openai-img2img', label: '图生图', method: 'POST' },
          { key: 'openai-analyze-img', label: '分析图片', method: 'POST' },
        ],
      },
      {
        title: '视频',
        subtitle: 'sora, veo, 可灵, 通义万象',
        items: [
          { key: 'video-params', label: 'VEO, SORA 接口参数信息汇总', icon: <IconArticle size="small" /> },
          { key: 'video-txt2video', label: '文生视频-异步', method: 'POST' },
          { key: 'video-img2video', label: '图生视频-异步', method: 'POST' },
          { key: 'video-status', label: '查询视频状态', method: 'GET' },
        ],
      },
      {
        title: '语音',
        items: [
          { key: 'audio-reply', label: '语音回复', method: 'POST' },
          { key: 'audio-recognize', label: '语音识别', method: 'POST' },
          { key: 'audio-tts', label: '语音合成', method: 'POST' },
        ],
      },
      {
        title: '其他',
        items: [
          { key: 'embedding', label: '文本向量化', method: 'POST' },
          { key: 'music-lyrics', label: '生成歌词', method: 'POST' },
          { key: 'music-generate', label: '生成音乐', method: 'POST' },
        ],
      },
    ],
  },
  {
    title: 'Anthropic 接口',
    items: [
      { key: 'anthropic-guide', label: 'Anthropic SDK使用指南', icon: <IconArticle size="small" /> },
      { key: 'anthropic-chat', label: '聊天', method: 'POST' },
      { key: 'anthropic-cache', label: '聊天(Prompt Cache)', method: 'POST' },
      { key: 'anthropic-stream', label: '流式返回', method: 'POST' },
      { key: 'anthropic-thinking', label: '聊天(深度思考)', method: 'POST' },
      { key: 'anthropic-tools', label: '工具调用', method: 'POST' },
      { key: 'anthropic-vision', label: '分析图片', method: 'POST' },
    ],
  },
  {
    title: 'Gemini 接口',
    items: [
      { key: 'gemini-guide', label: 'Gemini SDK使用指南', icon: <IconArticle size="small" /> },
      { key: 'gemini-chat', label: '聊天', method: 'POST' },
      { key: 'gemini-stream', label: '流式返回', method: 'POST' },
      { key: 'gemini-search', label: '联网搜索', method: 'POST' },
      { key: 'gemini-txt2img', label: '文生图', method: 'POST' },
      { key: 'gemini-img2img', label: '图生图', method: 'POST' },
      { key: 'gemini-vision', label: '分析图片', method: 'POST' },
    ],
  },
  {
    title: 'Midjourney 接口',
    items: [
      { key: 'midjourney-guide', label: '接口使用示例 (局部重绘)', icon: <IconArticle size="small" /> },
      { key: 'mj-query', label: '任务查询接口', method: 'GET' },
      { key: 'mj-seed', label: '获取种子', method: 'GET' },
      { key: 'mj-imagine', label: '文生图', method: 'POST' },
      { key: 'mj-blend', label: '图片融合', method: 'POST' },
      { key: 'mj-describe', label: '图生文', method: 'POST' },
      { key: 'mj-faceswap', label: '换脸', method: 'POST' },
      { key: 'mj-upload', label: '上传', method: 'POST' },
      { key: 'mj-action', label: '按钮点击', method: 'POST' },
      { key: 'mj-modal', label: '窗口执行', method: 'POST' },
      { key: 'mj-refresh', label: '刷新链接', method: 'POST' },
      { key: 'mj-edit', label: '编辑图片', method: 'POST' },
    ],
  },
  {
    title: '第三方接入',
    items: [
      { key: 'openclaw', label: 'OpenClaw接入APIPro', icon: <IconArticle size="small" /> },
    ],
  },
];

// 页面内容映射
const pageComponents = {
  'getting-started': GettingStarted,
  'base-url': BaseURL,
  'platform-guide': PlatformGuide,
  'openai-guide': OpenAIGuide,
  'responses-guide': ResponsesGuide,
  'models': ModelsAPI,
  'openai-chat': OpenAIChat,
  'anthropic-guide': AnthropicGuide,
  'gemini-guide': GeminiGuide,
  'video-params': VideoParams,
  'midjourney-guide': MidjourneyGuide,
  'openclaw': OpenClawGuide,
};

const MethodTag = ({ method }) => {
  const colors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    DELETE: 'red',
  };
  return (
    <Tag size="small" color={colors[method] || 'grey'} className="!text-xs !px-1.5 !py-0 !rounded font-mono">
      {method}
    </Tag>
  );
};

const SidebarItem = ({ item, activeKey, onClick }) => {
  const isActive = activeKey === item.key;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-all duration-150 ${
        isActive
          ? 'bg-semi-color-primary-light-default text-semi-color-primary font-medium'
          : 'text-semi-color-text-2 hover:bg-semi-color-fill-0 hover:text-semi-color-text-0'
      }`}
      onClick={() => onClick(item.key)}
    >
      {item.icon && <span className="flex-shrink-0 opacity-60">{item.icon}</span>}
      {item.method && <MethodTag method={item.method} />}
      <span className="truncate">{item.label}</span>
    </div>
  );
};

const SidebarGroup = ({ group, activeKey, onItemClick, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <div
        className="flex items-center gap-1 px-2 py-1 cursor-pointer text-xs font-semibold text-semi-color-text-1 uppercase tracking-wider hover:text-semi-color-text-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <IconChevronDown size="extra-small" /> : <IconChevronRight size="extra-small" />}
        <span>{group.title}</span>
        {group.subtitle && (
          <span className="text-semi-color-text-3 font-normal normal-case tracking-normal ml-1">
            {group.subtitle}
          </span>
        )}
      </div>
      {isOpen && (
        <div className="ml-2">
          {group.items?.map((item) => (
            <SidebarItem key={item.key} item={item} activeKey={activeKey} onClick={onItemClick} />
          ))}
          {group.subGroups?.map((sub, idx) => (
            <SidebarGroup key={idx} group={sub} activeKey={activeKey} onItemClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

const Document = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // 从URL hash获取当前页面
  const activeKey = useMemo(() => {
    const hash = location.hash.replace('#', '');
    return hash || 'getting-started';
  }, [location.hash]);

  const handleItemClick = (key) => {
    navigate(`/document#${key}`, { replace: true });
    if (isMobile) setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const ActiveComponent = pageComponents[activeKey];

  // 找到当前页面信息
  const currentPageInfo = useMemo(() => {
    for (const section of sidebarData) {
      for (const item of section.items || []) {
        if (item.key === activeKey) return item;
      }
      for (const sub of section.subGroups || []) {
        for (const item of sub.items || []) {
          if (item.key === activeKey) return item;
        }
      }
    }
    return null;
  }, [activeKey]);

  return (
    <div className="flex min-h-screen bg-semi-color-bg-0 mt-[60px]">
      {/* 移动端侧边栏切换按钮 */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-[70px] left-2 z-50 p-2 rounded-lg bg-semi-color-bg-2 shadow-md border border-semi-color-border"
        >
          <IconList />
        </button>
      )}

      {/* 侧边栏 */}
      <aside
        className={`${
          isMobile
            ? `fixed top-[60px] left-0 z-40 h-[calc(100vh-60px)] w-72 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'sticky top-[60px] h-[calc(100vh-60px)] w-72 flex-shrink-0'
        } bg-semi-color-bg-1 border-r border-semi-color-border overflow-y-auto`}
      >
        {/* 导航链接 */}
        <div className="px-2 py-3">
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-semi-color-text-2 hover:bg-semi-color-fill-0 hover:text-semi-color-text-0 mb-2"
          >
            <IconHome size="small" />
            <span>网站首页</span>
          </a>
        </div>

        {/* 导航树 */}
        <nav className="px-2 pb-6">
          {sidebarData.map((section, idx) => (
            <SidebarGroup
              key={idx}
              group={section}
              activeKey={activeKey}
              onItemClick={handleItemClick}
            />
          ))}
        </nav>
      </aside>

      {/* 遮罩层（移动端） */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <main className={`flex-1 min-w-0 ${isMobile ? 'w-full' : ''}`}>
        <div className="max-w-4xl mx-auto px-6 py-8 md:px-10 md:py-10">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-center py-20">
              <Title heading={3} className="text-semi-color-text-2 mb-4">
                {currentPageInfo?.label || '页面开发中'}
              </Title>
              <Paragraph className="text-semi-color-text-3">
                该接口文档正在完善中，请参考
                <a href="https://apipro.apifox.cn/" target="_blank" rel="noopener noreferrer" className="text-semi-color-primary mx-1">
                  在线文档
                </a>
                获取最新信息。
              </Paragraph>
              {currentPageInfo?.method && (
                <div className="mt-4">
                  <MethodTag method={currentPageInfo.method} />
                  <Text className="ml-2 text-semi-color-text-3">{currentPageInfo.label}</Text>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="border-t border-semi-color-border px-6 py-4 text-center">
          <Text type="tertiary" size="small">
            Built with APIPro · API Documentation
          </Text>
        </div>
      </main>
    </div>
  );
};

export default Document;
