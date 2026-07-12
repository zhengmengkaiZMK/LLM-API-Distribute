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
        title="Commercial Terms of Service - Enterprise AI API"
        description="LINGTRUEAPI commercial terms of service for business and enterprise customers. SLA guarantees, billing terms, data handling, and support commitments."
        keywords="AI API commercial terms,enterprise API service agreement,SLA guarantee,LINGTRUEAPI business terms"
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
