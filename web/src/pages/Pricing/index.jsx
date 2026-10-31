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
      title="AI 模型定价 - GPT、Claude、Gemini 按量价格对比"
      description="对比 35+ AI 模型的按量价格。通过 LingTrue 统一网关使用 GPT、Claude、Gemini，无月费，智能路由帮助降低调用成本。"
      keywords="AI API定价,模型价格,GPT API价格,Claude API价格,Gemini API价格,按量计费,LingTrue"
      canonicalPath="/pricing"
    />
    <h1 className="sr-only">AI 模型定价 - 对比 GPT、Claude、Gemini 的按量价格</h1>
    <ModelPricingPage />
  </>
);

export default Pricing;
