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
import usagePolicyMarkdown from './content/usagePolicy';
import SEOHead from '../../components/common/SEOHead';

const UsagePolicy = () => {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title="使用政策"
        description="LingTrue 使用政策说明可接受的使用方式、禁止行为，以及使用本 AI API 网关时需要遵守的要求。"
        keywords="LingTrue,使用政策,可接受使用"
        canonicalPath="/legal/usage-policy"
      />
      <LegalDocLayout title={t('使用政策')} content={usagePolicyMarkdown} />
    </>
  );
};

export default UsagePolicy;
