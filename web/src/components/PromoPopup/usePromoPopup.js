import React, { useState, useCallback, useContext } from 'react';
import { API } from '../../helpers';
import { UserContext } from '../../context/User';

/**
 * 弹窗充值触发 Hook
 * 管理弹窗的显示逻辑和配置获取
 *
 * 触发规则：
 * - 首次登录后台 → 永久一次（localStorage: promo_first_login_shown_{userId}）
 * - 余额 < 0.3 USD → 永久一次（localStorage: promo_low_balance_shown_{userId}）
 */
const usePromoPopup = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);
  const [userState] = useContext(UserContext);

  const checkAndShow = useCallback(
    async (isFirstLogin = false) => {
      const userId = userState?.user?.id;
      if (!userId) return;

      try {
        // 1. 获取弹窗配置
        const res = await API.get('/api/user/promo_popup/config');
        const { success, data } = res.data;
        if (!success || !data?.enabled) return;

        setConfig(data);

        // 2. 首次登录检查
        if (isFirstLogin) {
          const firstLoginKey = `promo_first_login_shown_${userId}`;
          if (!localStorage.getItem(firstLoginKey)) {
            localStorage.setItem(firstLoginKey, 'true');
            setVisible(true);

            // GA4 事件追踪
            if (window.gtag) {
              window.gtag('event', 'promo_popup_view', {
                trigger: 'first_login',
                amount: data.amount,
                discount: data.discount,
              });
            }
            return;
          }
        }

        // 3. 低余额检查（余额 < 0.3 USD）
        const quota = userState?.user?.quota || 0;
        const balanceUSD = quota / 500000; // QuotaPerUnit
        if (balanceUSD < 0.3) {
          const lowBalanceKey = `promo_low_balance_shown_${userId}`;
          if (!localStorage.getItem(lowBalanceKey)) {
            localStorage.setItem(lowBalanceKey, 'true');
            setVisible(true);

            // GA4 事件追踪
            if (window.gtag) {
              window.gtag('event', 'promo_popup_view', {
                trigger: 'low_balance',
                amount: data.amount,
                discount: data.discount,
              });
            }
            return;
          }
        }
      } catch (e) {
        console.error('Failed to check promo popup:', e);
      }
    },
    [userState?.user?.id, userState?.user?.quota],
  );

  const close = useCallback(() => {
    setVisible(false);
    // GA4 事件追踪
    if (window.gtag) {
      window.gtag('event', 'promo_popup_close', {
        amount: config?.amount,
        discount: config?.discount,
      });
    }
  }, [config]);

  return { visible, config, checkAndShow, close };
};

export default usePromoPopup;
