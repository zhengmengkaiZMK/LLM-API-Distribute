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
import LegalDocLayout from './LegalDocLayout';
import commercialTermsMarkdown from './content/commercialTerms';
import SEOHead from '../../components/common/SEOHead';

const CommercialTerms = () => {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title="商业服务条款"
        description="LingTrue 商业服务条款说明企业客户的服务协议、计费与数据处理约定。"
        keywords="LingTrue,商业条款,服务协议"
        canonicalPath="/legal/commercial-terms"
      />
      <LegalDocLayout
        title={t('商业服务条款')}
        content={commercialTermsMarkdown}
      />
    </>
  );
};

export default CommercialTerms;
