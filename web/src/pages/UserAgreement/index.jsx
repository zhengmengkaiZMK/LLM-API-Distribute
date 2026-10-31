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
import { useTranslation } from 'react-i18next';
import DocumentRenderer from '../../components/common/DocumentRenderer';
import SEOHead from '../../components/common/SEOHead';

const UserAgreement = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="用户协议"
        description="LingTrue 用户协议说明注册与使用本 AI API 网关服务时的权利与义务。"
        keywords="LingTrue,用户协议,服务条款"
        canonicalPath="/user-agreement"
      />
      <DocumentRenderer
        apiEndpoint='/api/user-agreement'
        title={t('用户协议')}
        cacheKey='user_agreement'
        emptyMessage={t('加载用户协议内容失败...')}
      />
    </>
  );
};

export default UserAgreement;
