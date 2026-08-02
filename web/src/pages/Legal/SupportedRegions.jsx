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
import supportedRegionsMarkdown from './content/supportedRegions';
import SEOHead from '../../components/common/SEOHead';

const SupportedRegions = () => {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title="AI API Supported Countries & Regions - Global AI API Coverage | LingTrue"
        description="LingTrue AI API gateway is available in 180+ countries. Check supported regions for our unified AI API service providing GPT, Claude, Gemini API access worldwide."
        keywords="AI API supported countries,AI API global access,AI API regions,LingTrue coverage,AI API availability"
        canonicalPath="/legal/supported-regions"
      />
      <LegalDocLayout
        title={t('支持的国家和地区')}
        content={supportedRegionsMarkdown}
      />
    </>
  );
};

export default SupportedRegions;
