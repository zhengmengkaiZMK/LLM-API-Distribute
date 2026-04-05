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

import React, { useEffect, useState, useContext } from 'react';
import { Button, Modal, Empty } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { UserContext } from '../../context/User';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';
import { Sparkles } from 'lucide-react';

/**
 * 首次登录弹窗组件
 * 仅在新用户首次进入控制台时显示一次
 */
const FirstLoginModal = ({ visible, onClose, isMobile }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userState] = useContext(UserContext);

  // 获取首次登录弹窗内容
  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/first_login_popup');
      const { success, message, data } = res.data;
      if (success && data) {
        const { content: popupContent } = data;
        if (popupContent && popupContent.trim() !== '') {
          const htmlContent = marked.parse(popupContent);
          setContent(htmlContent);
        } else {
          setContent('');
        }
      } else {
        if (message) showError(message);
      }
    } catch (error) {
      console.error('获取首次登录弹窗内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 标记弹窗已显示（写入 localStorage）
  const markAsShown = () => {
    const userId = userState?.user?.id;
    if (userId) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`popup_last_shown_${userId}`, today);
    }
  };

  // 关闭弹窗并标记已显示
  const handleClose = () => {
    markAsShown();
    onClose();
  };

  useEffect(() => {
    if (visible) {
      fetchContent();
    }
  }, [visible]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className='py-12'>
          <Empty description={t('加载中...')} />
        </div>
      );
    }

    if (!content) {
      return (
        <div className='py-12'>
          <Empty
            image={
              <IllustrationNoContent style={{ width: 150, height: 150 }} />
            }
            darkModeImage={
              <IllustrationNoContentDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无内容')}
          />
        </div>
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className='first-login-content max-h-[55vh] overflow-y-auto pr-2'
      />
    );
  };

  return (
    <Modal
      title={
        <div className='flex items-center gap-2'>
          <Sparkles size={20} className='text-yellow-500' />
          <span>{t('欢迎')}</span>
        </div>
      }
      visible={visible}
      onCancel={handleClose}
      footer={
        <div className='flex justify-end'>
          <Button type='primary' onClick={handleClose}>
            {t('我知道了')}
          </Button>
        </div>
      }
      size={isMobile ? 'full-width' : 'medium'}
      closeOnEsc={true}
      maskClosable={false}
    >
      {renderContent()}
    </Modal>
  );
};

export default FirstLoginModal;
