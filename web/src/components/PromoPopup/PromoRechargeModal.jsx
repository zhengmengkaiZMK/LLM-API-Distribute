import React, { useState } from 'react';
import { Modal, Button, Typography } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../helpers';
import { Sparkles, Zap, CreditCard } from 'lucide-react';

const { Text } = Typography;

/**
 * 弹窗充值组件
 * 展示促销折扣信息，支持支付宝和微信支付
 * 风格与网站整体 Semi Design + Tailwind 风格统一
 */
const PromoRechargeModal = ({ visible, config, onClose }) => {
  const { t } = useTranslation();
  const [payLoading, setPayLoading] = useState(null); // 'alipay' | 'wxpay' | null

  if (!config) return null;

  const { amount, discount } = config;
  const originalPrice = amount;
  const discountedPrice = (amount * discount).toFixed(2);
  const discountPercent = Math.round(discount * 10);
  const savedAmount = (originalPrice - discountedPrice).toFixed(2);

  const handlePay = async (payMethod) => {
    setPayLoading(payMethod);

    // GA4 事件追踪
    if (window.gtag) {
      window.gtag('event', 'promo_popup_pay', {
        payment_method: payMethod,
        amount: amount,
        discount: discount,
      });
    }

    try {
      const res = await API.post('/api/user/promo_pay', {
        amount: amount,
        payment_method: payMethod,
      });

      const { message, data, url } = res.data;
      if (message === 'success') {
        // 跳转到支付页面（与钱包支付相同的跳转逻辑）
        let params = data;
        let form = document.createElement('form');
        form.action = url;
        form.method = 'POST';

        let ipt;
        for (let key in params) {
          ipt = document.createElement('input');
          ipt.type = 'hidden';
          ipt.name = key;
          ipt.value = params[key];
          form.appendChild(ipt);
        }

        document.body.appendChild(form);
        form.submit();
        form.remove();
      } else {
        showError(data || t('支付请求失败'));
      }
    } catch (error) {
      showError(t('网络错误，请稍后重试'));
    } finally {
      setPayLoading(null);
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      closeOnEsc={true}
      maskClosable={true}
      centered
      width={400}
      bodyStyle={{ padding: 0 }}
      className='promo-modal-wrapper'
    >
      {/* 主容器：马卡龙模糊球背景 */}
      <div className='with-pastel-balls relative overflow-hidden rounded-xl'>
        {/* 顶部装饰区 */}
        <div className='relative z-10 pt-8 pb-4 px-6 text-center'>
          {/* 标签 */}
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 mb-4'>
            <Sparkles size={14} className='text-yellow-500' />
            <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>
              {t('限时折扣优惠')}
            </span>
          </div>

          {/* 主标题 */}
          <h2 className='text-xl font-bold text-semi-color-text-0 mb-1'>
            {t('充值')} {amount} {t('元')}
          </h2>
          <p className='text-sm text-semi-color-text-2'>
            {t('享')}{' '}
            <span className='font-bold text-semi-color-primary'>
              {discountPercent} {t('折')}
            </span>{' '}
            {t('优惠')}
          </p>
        </div>

        {/* 价格展示卡片 */}
        <div className='relative z-10 px-6 pb-2'>
          <div className='rounded-2xl border border-semi-color-border bg-semi-color-bg-0/80 backdrop-blur-sm p-5 text-center'>
            {/* 价格行 */}
            <div className='flex items-center justify-center gap-3 mb-3'>
              <Text
                type='tertiary'
                className='line-through text-base'
              >
                ¥{originalPrice}
              </Text>
              <span className='text-3xl font-extrabold' style={{ color: 'var(--semi-color-primary)' }}>
                ¥{discountedPrice}
              </span>
            </div>

            {/* 节省提示 */}
            {discount < 1 && (
              <div className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-semi-color-success-light-default'>
                <Zap size={13} style={{ color: 'var(--semi-color-success)' }} />
                <span className='text-xs font-medium' style={{ color: 'var(--semi-color-success)' }}>
                  {t('立省')} ¥{savedAmount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 支付按钮区 */}
        <div className='relative z-10 px-6 pt-3 pb-6 flex flex-col gap-2.5'>
          <Button
            size='large'
            theme='solid'
            type='primary'
            loading={payLoading === 'alipay'}
            disabled={payLoading !== null && payLoading !== 'alipay'}
            onClick={() => handlePay('alipay')}
            icon={<CreditCard size={16} />}
            className='!h-11 !rounded-xl !font-semibold'
            block
          >
            {t('支付宝支付')}
          </Button>

          <Button
            size='large'
            loading={payLoading === 'wxpay'}
            disabled={payLoading !== null && payLoading !== 'wxpay'}
            onClick={() => handlePay('wxpay')}
            icon={<CreditCard size={16} />}
            className='!h-11 !rounded-xl !font-semibold'
            style={{
              backgroundColor: 'var(--semi-color-success)',
              borderColor: 'var(--semi-color-success)',
              color: '#fff',
            }}
            block
          >
            {t('微信支付')}
          </Button>

          <Text type='tertiary' className='text-center !text-xs mt-1'>
            {t('支付后额度自动到账')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default PromoRechargeModal;
