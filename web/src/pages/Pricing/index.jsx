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
import ModelPricingPage from '../../components/table/model-pricing/layout/PricingPage';
import SEOHead from '../../components/common/SEOHead';

const Pricing = () => (
  <>
    <SEOHead
      title="AI API Pricing - Compare GPT, Claude, Gemini API Cost Per Token | LingTrue"
      description="Compare AI API pricing for 35+ models. GPT API, Claude API, Gemini API cost per token side by side. Save 47% on AI API costs with LingTrue unified AI API gateway. No subscription."
      keywords="AI API pricing,AI API cost,GPT API price,Claude API pricing,Gemini API cost,AI API pay per token,cheap AI API,AI API price comparison,LingTrue pricing"
      canonicalPath="/pricing"
    />
    <h1 className="sr-only">AI API Pricing - Compare AI Model API Costs</h1>
    <ModelPricingPage />
  </>
);

export default Pricing;
