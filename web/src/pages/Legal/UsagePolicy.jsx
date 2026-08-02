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
        title="AI API Usage Policy - LingTrue Acceptable Use Guidelines"
        description="LingTrue AI API usage policy. Learn the acceptable use guidelines, permitted activities, and compliance requirements for our unified AI API gateway service."
        keywords="AI API usage policy,LingTrue policy,AI API acceptable use,AI API terms of use,AI API guidelines"
        canonicalPath="/legal/usage-policy"
      />
      <LegalDocLayout title={t('使用政策')} content={usagePolicyMarkdown} />
    </>
  );
};

export default UsagePolicy;
