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

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import MarkdownRenderer from '../../components/common/markdown/MarkdownRenderer';

const { Title } = Typography;

/**
 * 注册前必读法律文档统一布局
 * @param {string} title - 中文标题
 * @param {string} content - Markdown 正文字符串
 */
const LegalDocLayout = ({ title, content }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    // 优先返回上一页（保留注册页已填写的内容），否则回注册页
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/register');
    }
  };

  const otherDocs = [
    { path: '/legal/usage-policy', label: t('使用政策') },
    { path: '/legal/supported-regions', label: t('支持的国家和地区') },
    { path: '/legal/commercial-terms', label: t('商业服务条款') },
  ];

  const relatedPages = [
    { path: '/', label: t('AI API Gateway Home') },
    { path: '/pricing', label: t('AI API Pricing') },
    { path: '/document', label: t('AI API Documentation') },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8'>
        {/* 顶部返回栏 */}
        <div className='flex items-center justify-between mb-6'>
          <Button
            theme='borderless'
            type='tertiary'
            icon={<IconArrowLeft />}
            onClick={handleBack}
          >
            {t('返回注册页')}
          </Button>
          <div className='hidden sm:flex items-center gap-3 text-sm'>
            {otherDocs
              .filter((d) => d.label !== title)
              .map((d) => (
                <Link
                  key={d.path}
                  to={d.path}
                  className='text-blue-600 hover:text-blue-800'
                >
                  {d.label}
                </Link>
              ))}
          </div>
        </div>

        {/* 正文卡片 */}
        <div className='bg-white rounded-lg shadow-sm p-6 sm:p-10'>
          <Title heading={1} className='text-center mb-8'>
            {title}
          </Title>
          <div className='prose prose-lg max-w-none'>
            <MarkdownRenderer content={content} />
          </div>
        </div>

        {/* 底部返回栏 */}
        <div className='flex justify-center mt-8'>
          <Button
            theme='solid'
            type='primary'
            className='!rounded-full px-8'
            onClick={handleBack}
          >
            {t('返回注册页')}
          </Button>
        </div>

        {/* 相关页面内链 */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-sm text-gray-500 mb-3'>{t('相关页面')}</p>
          <div className='flex flex-wrap gap-3'>
            {relatedPages.map((p) => (
              <Link
                key={p.path}
                to={p.path}
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocLayout;
