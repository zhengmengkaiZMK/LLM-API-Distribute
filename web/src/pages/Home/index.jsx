/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import SEOHead from '../../components/common/SEOHead';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent(t('加载首页内容失败...'));
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  const faqData = [
    {
      num: '01',
      question: t('使用 LingTrue 替代直接调用官方 API，我能节省多少成本？'),
      answer: t('根据 LingTrue 平台运营数据，用户在 AI API 成本上平均节省 47%，节省范围在 20%~70% 之间。以 GPT-4 为例，OpenAI 官方输入价格为 $30/MTok，而通过 LingTrue 智能路由，实际成本可低至 $14/MTok，节省比例达 53%。系统持续监控 OpenAI、Anthropic、Google 等多家服务商的实时价格和延迟指标，每秒自动评估最优路由，确保稳定低延迟不掺水。'),
    },
    {
      num: '02',
      question: t('LingTrue 的计费方式是怎样的？有没有隐藏费用？'),
      answer: t('LingTrue 采用按量付费模式，仅按实际 Token 消耗计费，无月费、无隐藏费用。充值余额永不过期，支持支付宝、微信支付和 Stripe 国际支付。所有费用明细可在控制台实时查看，支持按模型、按时间段查看详细账单。'),
    },
    {
      num: '03',
      question: t('把 LingTrue 集成到现有应用里需要多长时间？'),
      answer: t('大多数开发者可以在 3 分钟内完成集成。只需将现有代码中的 Base URL 替换为 LingTrue 网关地址（https://www.lingtrue.com/v1），API Key 换成 LingTrue 令牌密钥即可，无需修改任何业务逻辑代码。完全兼容 OpenAI、Anthropic、Google 等主流 SDK 格式。'),
    },
    {
      num: '04',
      question: t('LingTrue 当前支持哪些 AI 模型和服务商？'),
      answer: t('LingTrue 支持 35+ 主流 AI 模型，涵盖 Claude opus 4.6、GPT 5.4、Gemini 3.1 Pro、DeepSeek、Qwen 等顶级大模型，覆盖对话、图像、视频、语音等多模态能力，并持续接入最新发布的模型。'),
    },
    {
      num: '05',
      question: t('LingTrue 提供服务的区域有哪些？'),
      answer: (
        <>
          <span className='block mb-2'>
            {t('我们目前提供商业 API 访问的国家、地区和领土：')}
          </span>
          <span className='block max-h-64 overflow-y-auto pr-2 text-semi-color-text-2 leading-relaxed'>
            {t('阿尔巴尼亚、阿尔及利亚、安道尔、安哥拉、安提瓜和巴布达、阿根廷、亚美尼亚、澳大利亚、奥地利、阿塞拜疆、巴哈马、巴林、孟加拉国、巴巴多斯、比利时、伯利兹、贝宁、不丹、玻利维亚、波斯尼亚和黑塞哥维那、博茨瓦纳、巴西、文莱、保加利亚、布基纳法索、布隆迪、佛得角、柬埔寨、喀麦隆、加拿大、乍得、智利、哥伦比亚、科摩罗、刚果（布拉柴维尔）、哥斯达黎加、科特迪瓦、克罗地亚、塞浦路斯、捷克（捷克共和国）、丹麦、吉布提、多米尼克、多米尼加共和国、厄瓜多尔、埃及、萨尔瓦多、赤道几内亚、爱沙尼亚、斯威士兰、斐济、芬兰、法国、加蓬、冈比亚、格鲁吉亚、德国、加纳、希腊、格林纳达、危地马拉、几内亚、几内亚比绍、圭亚那、海地、洪都拉斯、匈牙利、冰岛、印度、印度尼西亚、伊拉克、爱尔兰、以色列、意大利、牙买加、日本、约旦、哈萨克斯坦、肯尼亚、基里巴斯、科威特、吉尔吉斯斯坦、老挝、拉脱维亚、黎巴嫩、莱索托、利比里亚、列支敦士登、立陶宛、卢森堡、马达加斯加、马拉维、马来西亚、马尔代夫、马耳他、马绍尔群岛、毛里塔尼亚、毛里求斯、墨西哥、密克罗尼西亚、摩尔多瓦、摩纳哥、蒙古、黑山、摩洛哥、莫桑比克、纳米比亚、瑙鲁、尼泊尔、荷兰、新西兰、尼日尔、尼日利亚、北马其顿、挪威、阿曼、巴基斯坦、帕劳、巴勒斯坦、巴拿马、巴布亚新几内亚、巴拉圭、秘鲁、菲律宾、波兰、葡萄牙、卡塔尔、罗马尼亚、卢旺达、圣基茨和尼维斯、圣卢西亚、圣文森特和格林纳丁斯、萨摩亚、圣马力诺、圣多美和普林西比、沙特阿拉伯、塞内加尔、塞尔维亚、塞舌尔、塞拉利昂、新加坡、斯洛伐克、斯洛文尼亚、所罗门群岛、南非、韩国、西班牙、斯里兰卡、苏里南、瑞典、瑞士、中国台湾、塔吉克斯坦、坦桑尼亚、泰国、东帝汶、多哥、汤加、特立尼达和多巴哥、突尼斯、土耳其、土库曼斯坦、图瓦卢、乌干达、乌克兰（克里米亚、顿涅茨克、赫尔松、卢甘斯克和扎波罗热地区除外）、阿联酋、英国、美国、乌拉圭、乌兹别克斯坦、瓦努阿图、梵蒂冈城、越南、赞比亚、津巴布韦')}
          </span>
          <span className='block mt-2 text-xs text-semi-color-text-3'>
            {t('完整列表与最新动态见 ')}
            <Link to='/legal/supported-regions' className='text-blue-600 hover:text-blue-800'>
              {t('《支持的国家和地区》')}
            </Link>
            {t('。')}
          </span>
        </>
      ),
    },
  ];

  const stepsData = [
    {
      num: '01',
      title: t('注册账号'),
      desc: t('30 秒完成快速注册，赠送免费额度。'),
    },
    {
      num: '02',
      title: t('创建 API Key'),
      desc: t('一键生成全球通用的 API Key，支持灵活管理与权限控制。'),
    },
    {
      num: '03',
      title: t('选择集成方式'),
      desc: t('支持 OpenAI、Anthropic、Google 等格式，统一网关自动适配，无需重构现有代码。'),
    },
    {
      num: '04',
      title: t('开始调用'),
      desc: t('更新 Base URL 和 API Key，立即享受智能路由与成本优化能力。'),
    },
  ];

  const featureCards = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: t('实时调度'),
      desc: t('健康度与延迟权重动态切换，保证最优响应。'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      title: t('统一监控'),
      desc: t('调用、费用、异常一站式可视化，随时掌握运行状态。'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: t('智能限流'),
      desc: t('多维策略保障核心业务优先级，避免突发拥堵。'),
    },
  ];

  return (
    <>
    <SEOHead
      title="AI API Gateway - Unified AI API Access for GPT, Claude, Gemini | LingTrue"
      description="LingTrue AI API gateway unifies 35+ AI APIs into one endpoint. Access GPT, Claude, Gemini AI API at up to 47% lower cost. One AI API key, pay-per-token, integrate in 3 minutes."
      keywords="AI API,AI API gateway,unified AI API,AI API access,GPT API,Claude API,Gemini API,AI API proxy,cheap AI API,OpenAI API alternative,multi-model AI API,LingTrue API"
      canonicalPath="/"
    />
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* Hero 区域 */}
          <div className='w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-hidden'>
            {/* 背景模糊晕染球 */}
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />

            <div className='flex items-center justify-center h-full px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20 lg:py-28 mt-10'>
              <div className='flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-4 max-w-6xl mx-auto w-full'>

                {/* 左侧文字区域 */}
                <div className='flex flex-col items-center lg:items-start text-center lg:text-left flex-1 min-w-0'>
                  {/* 标签 */}
                  <div className='inline-flex items-center px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 mb-6'>
                    <span className='text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium'>
                      {t('面向生产级的AI生产力基座')}
                    </span>
                  </div>

                  {/* 主标题 */}
                  <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-6xl font-bold text-semi-color-text-0 leading-[1.15] mb-4 md:mb-6'>
                    {t('统一的大模型接口网关')}
                    <br />
                    <span className='shine-text'>{t('链接全球 AI 能力')}</span>
                  </h1>

                  {/* 描述文字 */}
                  <p className='text-sm sm:text-base md:text-lg text-semi-color-text-2 leading-relaxed mb-6 md:mb-8 max-w-lg'>
                    {t('以超低的价格运行Claude、GPT、Gemini等顶级模型，为生产级工作提供 99.8% 可靠性')}
                  </p>

                  {/* URL 输入框 */}
                  <div className='w-full max-w-md mb-6'>
                    <div className='text-xs text-semi-color-text-2 mb-2'>
                      {t('替换基础 URL 即可接入')}
                    </div>
                    <Input
                      readonly
                      value={serverAddress}
                      className='!rounded-xl'
                      size={isMobile ? 'default' : 'large'}
                      suffix={
                        <div className='flex items-center gap-2'>
                          <ScrollList
                            bodyHeight={32}
                            style={{ border: 'unset', boxShadow: 'unset' }}
                          >
                            <ScrollItem
                              mode='wheel'
                              cycled={true}
                              list={endpointItems}
                              selectedIndex={endpointIndex}
                              onSelect={({ index }) => setEndpointIndex(index)}
                            />
                          </ScrollList>
                          <Button
                            type='primary'
                            onClick={handleCopyBaseURL}
                            icon={<IconCopy />}
                            className='!rounded-lg'
                          />
                        </div>
                      }
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className='flex flex-row gap-3 sm:gap-4 items-center mb-8 md:mb-10'>
                    <Link to='/console'>
                      <Button
                        theme='solid'
                        type='primary'
                        size={isMobile ? 'default' : 'large'}
                        className='!rounded-3xl px-6 sm:px-8 py-2'
                        icon={<IconPlay />}
                      >
                        {t('获取密钥')}
                      </Button>
                    </Link>
                    {isDemoSiteMode && statusState?.status?.version ? (
                      <Button
                        size={isMobile ? 'default' : 'large'}
                        className='flex items-center !rounded-3xl px-5 sm:px-6 py-2'
                        icon={<IconGithubLogo />}
                        onClick={() =>
                          window.open(
                            'https://github.com/QuantumNous/new-api',
                            '_blank',
                          )
                        }
                      >
                        {statusState.status.version}
                      </Button>
                    ) : (
                      docsLink && (
                        <a href='https://lingtrue.apifox.cn' target='_blank' rel='noopener noreferrer'>
                          <Button
                            size={isMobile ? 'default' : 'large'}
                            className='flex items-center !rounded-3xl px-5 sm:px-6 py-2'
                            icon={<IconFile />}
                          >
                            {t('文档')}
                          </Button>
                        </a>
                      )
                    )}
                  </div>

                  {/* 底部统计数字 */}
                  <div className='flex flex-row gap-4 sm:gap-6 md:gap-8'>
                    {[
                      { num: '35+', label: t('可覆盖模型') },
                      { num: '99.8%', label: t('SLA 可用性') },
                      { num: '3', label: t('多区域节点') },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className='hero-float-card flex flex-col items-center px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-xl border border-semi-color-border bg-semi-color-bg-0'
                        style={{ animationDelay: `${idx * 0.6}s` }}
                      >
                        <span className='text-xl sm:text-2xl md:text-3xl font-bold text-semi-color-text-0'>
                          {item.num}
                        </span>
                        <span className='text-[10px] sm:text-xs text-semi-color-text-2 mt-0.5'>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右侧功能卡片区域 */}
                <div className='flex flex-col gap-4 w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 mt-4 lg:mt-8 lg:-ml-8 xl:-ml-12'>
                  {featureCards.map((card, idx) => (
                    <div
                      key={idx}
                      className='hero-float-card rounded-2xl border border-semi-color-border bg-semi-color-bg-0 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300'
                      style={{
                        animationDelay: `${idx * 0.6}s`,
                      }}
                    >
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0'>
                          {card.icon}
                        </div>
                        <span className='text-base sm:text-lg font-semibold text-semi-color-text-0'>
                          {card.title}
                        </span>
                      </div>
                      <p className='text-xs sm:text-sm text-semi-color-text-2 leading-relaxed pl-11 sm:pl-12'>
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* 为什么选择 LingTrue */}
          <div className='why-lingtrue w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12'>
            <div className='max-w-6xl mx-auto'>
              {/* 标题区 */}
              <div className='text-center mb-10 md:mb-14'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-semi-color-text-0 mb-4'>
                  {t('为什么选择 LingTrue？')}
                </h2>
                <p className='text-sm sm:text-base md:text-lg text-semi-color-text-2 max-w-2xl mx-auto'>
                  {t('让 AI 集成变得简单、可靠且低成本的一体化 API 平台。')}
                </p>
              </div>

              {/* Bento Grid 布局 */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5'>

                {/* 左列 */}
                <div className='flex flex-col gap-4 md:gap-5'>
                  {/* 稳定的模型请求 */}
                  <div className='why-card-green group rounded-2xl border border-semi-color-border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-green-300 hover:-translate-y-0.5'
                    style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0f9ff 100%)' }}>
                    <h3 className='text-lg sm:text-xl font-bold text-emerald-700 mb-2'>
                      {t('稳定的模型请求')}
                    </h3>
                    <p className='text-sm sm:text-base text-semi-color-text-1 mb-5'>
                      <span className='font-semibold'>99.8%</span> {t('在线率与')}{' '}
                      <span className='font-semibold'>{t('自动故障转移')}</span>.
                    </p>
                    <div className='rounded-xl bg-semi-color-bg-0/70 border border-semi-color-border p-4 font-mono text-xs sm:text-sm text-semi-color-text-2 mb-5 leading-relaxed'>
                      <div>&gt; uptime: 99.8%</div>
                      <div>&gt; failover: auto</div>
                      <div>&gt; latency: &lt;50ms</div>
                    </div>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-3xl sm:text-4xl font-bold text-semi-color-text-0'>99.8%</span>
                      <span className='text-sm text-semi-color-text-2'>{t('在线率')}</span>
                    </div>
                  </div>

                  {/* 一个控制台 全面掌控 */}
                  <div className='why-card-cyan group rounded-2xl border border-semi-color-border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-cyan-300 hover:-translate-y-0.5'
                    style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 50%, #eff6ff 100%)' }}>
                    <h3 className='text-lg sm:text-xl font-bold text-cyan-700 mb-2'>
                      {t('一个控制台，全面掌控')}
                    </h3>
                    <p className='text-sm sm:text-base text-semi-color-text-1 mb-5'>
                      {t('追踪用量')}{' '}
                      <span className='text-semi-color-text-2'>{t('和')}</span>{' '}
                      {t('实时查看成本')}{t('。')}
                    </p>
                    <div className='flex items-end justify-between'>
                      <div className='flex items-baseline gap-2'>
                        <span className='text-3xl sm:text-4xl font-bold text-semi-color-text-0'>1</span>
                        <span className='text-sm text-semi-color-text-2'>{t('控制台')}</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-semi-color-text-2'>
                          <span className='font-semibold text-semi-color-text-0'>45K</span> {t('次调用')}
                        </div>
                        <div className='text-sm font-semibold text-emerald-600'>
                          {t('已节省')} $89
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右列 */}
                <div className='flex flex-col gap-4 md:gap-5'>
                  {/* 接入顶级 AI 模型 */}
                  <div className='why-card-dark group rounded-2xl border border-gray-700 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gray-800/30 hover:-translate-y-0.5'
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff' }}>
                    <h3 className='text-lg sm:text-xl font-bold mb-2' style={{ color: '#ffffff' }}>
                      {t('接入顶级 AI 模型')}
                    </h3>
                    <p className='text-sm sm:text-base mb-4 leading-relaxed' style={{ color: '#ffffff' }}>
                      {t('连接 Claude opus 4.6、GPT 5.4、Nano Banana Pro 和其他全球领先的AI大模型统一网关。')}
                    </p>
                    <div className='rounded-xl bg-black/40 border border-gray-600 p-4 font-mono text-xs sm:text-sm mb-5 leading-relaxed' style={{ color: '#ffffff' }}>
                      <div>{`{ "model": "claude opus 4.6" }`}</div>
                      <div>{`{ "model": "gpt 5.4" }`}</div>
                      <div>{`{ "model": "nano-banana-pro" }`}</div>
                    </div>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-3xl sm:text-4xl font-bold' style={{ color: '#ffffff' }}>{t('前 5 大')}</span>
                      <span className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>{t('全球顶级 AI 模型')}</span>
                    </div>
                  </div>

                  {/* 始终支付最合理价格 */}
                  <div className='why-card-purple group rounded-2xl border border-semi-color-border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-purple-300 hover:-translate-y-0.5'
                    style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #fce7f3 100%)' }}>
                    <h3 className='text-lg sm:text-xl font-bold text-purple-700 mb-2'>
                      {t('始终支付最合理价格')}
                    </h3>
                    <p className='text-sm sm:text-base text-semi-color-text-1 mb-5'>
                      {t('智能路由最高可节省 70% 费用')}
                    </p>
                    <div className='rounded-xl bg-semi-color-bg-0/70 border border-semi-color-border p-4 font-mono text-xs sm:text-sm text-semi-color-text-2 mb-5 leading-relaxed'>
                      <div>Claude opus4.6: $0.030 <span className='text-red-500'>✗</span></div>
                      <div>Best: $0.014 <span className='text-emerald-500'>✓</span></div>
                      <div>Saved: 53%</div>
                    </div>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-3xl sm:text-4xl font-bold text-purple-700'>70%</span>
                      <span className='text-sm text-semi-color-text-2'>{t('节省比例')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 4 步完成集成 */}
          <div className='w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12'>
            <div className='max-w-6xl mx-auto'>
              {/* 标题区 */}
              <div className='text-center mb-10 md:mb-14'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-semi-color-text-0 mb-4'>
                  {t('4 步完成集成')}
                </h2>
                <p className='text-sm sm:text-base md:text-lg text-semi-color-text-2 max-w-2xl mx-auto'>
                  {t('统一接口设计，兼容 OpenAI、Anthropic、Google 等主流 SDK，零门槛无缝接入。')}
                </p>
              </div>

              {/* 步骤卡片 */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                {stepsData.map((step, idx) => (
                  <div
                    key={idx}
                    className='step-card group relative rounded-2xl border border-semi-color-border bg-semi-color-bg-0 p-6 sm:p-7 cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20'
                  >
                    <span className='block text-3xl sm:text-4xl font-bold text-semi-color-text-3 group-hover:text-white/40 transition-colors duration-300 mb-4'>
                      {step.num}
                    </span>
                    <h3 className='text-base sm:text-lg font-semibold text-semi-color-text-0 group-hover:text-white transition-colors duration-300 mb-2'>
                      {step.title}
                    </h3>
                    <p className='text-xs sm:text-sm text-semi-color-text-2 group-hover:text-white/80 leading-relaxed transition-colors duration-300'>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 常见问题解答 */}
          <div className='w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12'>
            <div className='max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16'>
              {/* 左侧标题 */}
              <div className='lg:w-[240px] flex-shrink-0'>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-semi-color-text-0 mb-3'>
                  {t('常见问题解答')}
                </h2>
                <p className='text-sm text-semi-color-text-2 leading-relaxed'>
                  {t('关于如何通过 LingTrue 降低成本并提升可靠性的所有关键信息')}
                </p>
              </div>

              {/* 右侧问答列表 */}
              <div className='flex-1 divide-y divide-semi-color-border'>
                {faqData.map((item, idx) => (
                  <div key={idx} className='py-5 sm:py-6'>
                    <button
                      className='w-full flex items-start gap-4 sm:gap-6 text-left cursor-pointer bg-transparent border-none p-0'
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    >
                      <span className='text-2xl sm:text-3xl font-bold text-semi-color-text-3 italic flex-shrink-0 leading-none mt-1'>
                        {item.num}
                      </span>
                      <span className='flex-1 text-sm sm:text-base md:text-lg font-semibold text-semi-color-text-0 leading-snug'>
                        {item.question}
                      </span>
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className={`flex-shrink-0 text-semi-color-text-2 mt-1 transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}
                      >
                        <polyline points='6 9 12 15 18 9' />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedFaq === idx ? 'max-h-[480px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                    >
                      <div className='text-xs sm:text-sm text-semi-color-text-2 leading-relaxed pl-10 sm:pl-14 pr-8'>
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* SEO 内部链接与 CTA 区域 */}
          <div className='w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12 border-t border-semi-color-border'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-8'>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-semi-color-text-0 mb-3'>
                  {t('开始使用 LingTrue')}
                </h2>
                <p className='text-sm sm:text-base text-semi-color-text-2 max-w-2xl mx-auto'>
                  {t('国内领先的AI大模型API中转站，支持ChatGPT、Claude、Gemini等35+模型，智能路由低价稳定接入')}
                </p>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6'>
                <Link to='/pricing' className='group flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-semi-color-border bg-semi-color-bg-0 hover:shadow-md hover:border-blue-300 transition-all duration-300 no-underline'>
                  <span className='text-2xl mb-2'>💰</span>
                  <span className='text-sm sm:text-base font-semibold text-semi-color-text-0 group-hover:text-blue-600 transition-colors'>{t('模型定价')}</span>
                  <span className='text-xs text-semi-color-text-2 mt-1 text-center'>{t('GPT/Claude/Gemini API价格对比')}</span>
                </Link>
                <a href='https://lingtrue.apifox.cn/' target='_blank' rel='noopener noreferrer' className='group flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-semi-color-border bg-semi-color-bg-0 hover:shadow-md hover:border-blue-300 transition-all duration-300 no-underline'>
                  <span className='text-2xl mb-2'>📖</span>
                  <span className='text-sm sm:text-base font-semibold text-semi-color-text-0 group-hover:text-blue-600 transition-colors'>{t('接入文档')}</span>
                  <span className='text-xs text-semi-color-text-2 mt-1 text-center'>{t('3分钟完成API集成')}</span>
                </a>
                <Link to='/about' className='group flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-semi-color-border bg-semi-color-bg-0 hover:shadow-md hover:border-blue-300 transition-all duration-300 no-underline'>
                  <span className='text-2xl mb-2'>🏢</span>
                  <span className='text-sm sm:text-base font-semibold text-semi-color-text-0 group-hover:text-blue-600 transition-colors'>{t('关于我们')}</span>
                  <span className='text-xs text-semi-color-text-2 mt-1 text-center'>{t('了解 LingTrue 平台')}</span>
                </Link>
                <Link to='/register' className='group flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-semi-color-border bg-semi-color-bg-0 hover:shadow-md hover:border-blue-300 transition-all duration-300 no-underline'>
                  <span className='text-2xl mb-2'>🚀</span>
                  <span className='text-sm sm:text-base font-semibold text-semi-color-text-0 group-hover:text-blue-600 transition-colors'>{t('免费注册')}</span>
                  <span className='text-xs text-semi-color-text-2 mt-1 text-center'>{t('赠送免费额度，立即体验')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              title='首页内容'
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default Home;
