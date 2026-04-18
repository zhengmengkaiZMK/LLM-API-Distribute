import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { SiAlipay, SiWechat } from 'react-icons/si';
import { Clock, X } from 'lucide-react';
import { API, showError } from '../../../helpers';

/**
 * 弹窗充值组件 — 扁平简约 + 高转化设计
 */
const PopupRechargeModal = ({ visible, onClose, config, isMobile }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);

  // 倒计时（营造紧迫感，仅视觉层，不影响实际可用性）
  const [countdown, setCountdown] = useState(15 * 60); // 15分钟
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCountdown(15 * 60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [visible]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!config) return null;

  const { amount, discount } = config;
  const currentPrice = (amount * discount).toFixed(2);
  const hasDiscount = discount < 1;
  const savedAmount = hasDiscount ? (amount - amount * discount).toFixed(2) : 0;
  const discountLabel = hasDiscount
    ? `${Math.round(discount * 10)}折`
    : '';

  const handlePay = async (paymentMethod) => {
    setLoading(true);
    setActiveMethod(paymentMethod);
    try {
      if (window.gtag) {
        window.gtag('event', 'promo_popup_pay', {
          payment_method: paymentMethod,
          amount: config.amount,
          discount: config.discount,
        });
      }

      const res = await API.post('/api/user/promo_pay', {
        amount: parseInt(amount),
        payment_method: paymentMethod,
      });

      if (res?.data?.message === 'success') {
        const params = res.data.data;
        const url = res.data.url;
        const form = document.createElement('form');
        form.action = url;
        form.method = 'POST';
        const isSafari =
          navigator.userAgent.indexOf('Safari') > -1 &&
          navigator.userAgent.indexOf('Chrome') < 1;
        if (!isSafari) {
          form.target = '_blank';
        }
        for (let key in params) {
          let input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = params[key];
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        onClose();
      } else {
        const errorMsg =
          typeof res.data.data === 'string'
            ? res.data.data
            : res.data.message || t('支付失败');
        showError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      showError(t('支付请求失败'));
    } finally {
      setLoading(false);
      setActiveMethod(null);
    }
  };

  const handleClose = () => {
    if (window.gtag) {
      window.gtag('event', 'promo_popup_close', {
        amount: config?.amount,
        discount: config?.discount,
      });
    }
    onClose();
  };

  // 支付按钮渲染
  const PayButton = ({ method, label, icon, bgColor, hoverColor }) => (
    <button
      onClick={() => handlePay(method)}
      disabled={loading && activeMethod !== method}
      className='cursor-pointer flex items-center justify-center gap-2.5 w-full border-none transition-all duration-150 active:scale-[0.98]'
      style={{
        height: 46,
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        background: bgColor,
        color: '#fff',
        opacity: loading && activeMethod !== method ? 0.35 : 1,
        letterSpacing: '0.01em',
      }}
      onMouseEnter={(e) => {
        if (!(loading && activeMethod !== method))
          e.currentTarget.style.background = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bgColor;
      }}
    >
      {loading && activeMethod === method ? (
        <span
          className='inline-block animate-spin'
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
          }}
        />
      ) : (
        icon
      )}
      <span>{label}</span>
    </button>
  );

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      afterOpen={() => {
        if (window.gtag) {
          window.gtag('event', 'promo_popup_view', {
            amount: config?.amount,
            discount: config?.discount,
          });
        }
      }}
      header={null}
      footer={null}
      closable={false}
      maskClosable={false}
      size={isMobile ? 'full-width' : 'small'}
      bodyStyle={{ padding: 0 }}
      style={{ borderRadius: 12, overflow: 'visible', maxWidth: 400 }}
    >
      <div className='flex flex-col relative' style={{ borderRadius: 12, overflow: 'hidden' }}>
        {/* 右上角关闭按钮 — 定位在弹窗外部 */}
        <button
          onClick={handleClose}
          className='absolute cursor-pointer border-none text-white/70 hover:text-white transition-colors duration-150'
          style={{
            top: -36,
            right: -4,
            padding: 4,
            lineHeight: 0,
            zIndex: 10,
            background: 'transparent',
          }}
        >
          <X size={22} strokeWidth={2} />
        </button>
        <div className='px-7 pt-7 pb-6'>

          {/* ① 顶部：标题 + 倒计时徽章（同一行） */}
          <div className='flex items-center justify-between mb-1.5'>
            <h3
              className='text-slate-800 dark:text-slate-100'
              style={{
                fontSize: 19,
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {t('限时充值优惠')}
            </h3>
            {hasDiscount && (
              <span
                className='inline-flex items-center gap-1 shrink-0'
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#e85d04',
                  background: '#fff4e6',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                <Clock size={12} strokeWidth={2.5} />
                {formatTime(countdown)}
              </span>
            )}
          </div>

          {/* ② 副标题描述 */}
          <p
            className='text-slate-400 dark:text-slate-500'
            style={{ fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}
          >
            {hasDiscount
              ? t('仅限本次，关闭后将恢复原价')
              : `${t('充值')} ¥${amount} ${t('额度，即时到账')}`}
          </p>

          {/* ③ 价格区：大价格 + 原价 + 折扣标签 */}
          <div
            className='flex items-center justify-between py-5 px-5 mb-5'
            style={{
              borderRadius: 10,
              background: 'var(--semi-color-fill-0, #f8f9fa)',
            }}
          >
            {/* 左侧：价格 */}
            <div>
              <div className='flex items-baseline gap-2'>
                <span
                  className='text-slate-800 dark:text-slate-100'
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  <span style={{ fontSize: 20, fontWeight: 600 }}>¥</span>
                  {currentPrice}
                </span>
                {hasDiscount && (
                  <span
                    className='text-slate-300 dark:text-slate-600'
                    style={{
                      fontSize: 15,
                      textDecoration: 'line-through',
                      fontWeight: 400,
                    }}
                  >
                    ¥{amount}
                  </span>
                )}
              </div>
              <p
                className='text-slate-400 dark:text-slate-500'
                style={{ fontSize: 12, margin: '6px 0 0' }}
              >
                {t('充值')} ¥{amount} {t('额度')}
              </p>
            </div>

            {/* 右侧：折扣 / 节省标签 */}
            {hasDiscount && (
              <div className='text-right'>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#e85d04',
                    lineHeight: 1,
                  }}
                >
                  {discountLabel}
                </span>
                <p style={{ fontSize: 11, color: '#e85d04', margin: '4px 0 0', fontWeight: 500 }}>
                  {t('省')} ¥{savedAmount}
                </p>
              </div>
            )}
          </div>

          {/* ④ 支付按钮 */}
          <div className='flex gap-2.5'>
            <PayButton
              method='alipay'
              label={t('支付宝')}
              icon={<SiAlipay size={17} />}
              bgColor='#1677FF'
              hoverColor='#4096ff'
            />
            <PayButton
              method='wxpay'
              label={t('微信支付')}
              icon={<SiWechat size={17} />}
              bgColor='#2DC100'
              hoverColor='#3cd812'
            />
          </div>

          {/* ⑤ 信任信息 + 关闭 */}
          <div className='flex items-center justify-between mt-4'>
            <span
              className='text-slate-300 dark:text-slate-600'
              style={{ fontSize: 11 }}
            >
              {t('支付后额度即时到账')}
            </span>
            <button
              onClick={handleClose}
              className='cursor-pointer bg-transparent border-none text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors duration-150'
              style={{ fontSize: 12, padding: '2px 0' }}
            >
              {t('暂不需要')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PopupRechargeModal;
