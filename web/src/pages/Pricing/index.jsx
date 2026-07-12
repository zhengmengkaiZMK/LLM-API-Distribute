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
      title="AI Model API Pricing - Pay-Per-Token for GPT, Claude & Gemini"
      description="Transparent pay-per-token pricing for 35+ AI models. Access GPT, Claude, Gemini via one API. Save up to 47% vs official pricing. No subscription, no hidden fees."
      keywords="AI API pricing,GPT API cost,Claude API price,Gemini API pricing,pay per token,AI model pricing comparison,cheap AI API"
      canonicalPath="/pricing"
    />
    <ModelPricingPage />
  </>
);

export default Pricing;
