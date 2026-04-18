import { useState, useCallback, useRef, useContext } from 'react';
import { API } from '../../helpers';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';

/**
 * 弹窗充值触发逻辑 Hook
 *
 * 触发规则（同时检查，满足任一即弹）：
 * 1. 首次进入控制台（localStorage key: popup_recharge_first_login_{userId}，只弹一次）
 * 2. 余额 < 0.2 USD（当天首次触发时弹窗，用户关闭后当天不再弹出）
 *
 * 关键设计：
 * - 首次登录场景通过 localStorage 标记防止重复弹出
 * - 低余额场景：用户关闭弹窗时记录当天日期，当天内不再弹出，次日重置
 * - 使用 ref 保持最新 state，避免 stale closure
 */
const usePopupRecharge = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);
  const [userState] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);

  // 使用 ref 保持对最新 state 的引用，避免 stale closure 问题
  const userStateRef = useRef(userState);
  const statusStateRef = useRef(statusState);
  userStateRef.current = userState;
  statusStateRef.current = statusState;

  const checkAndShow = useCallback(async () => {
    // 从 ref 读取最新值，确保不受闭包陈旧问题影响
    const currentUserState = userStateRef.current;
    const currentStatusState = statusStateRef.current;

    const userId = currentUserState?.user?.id;
    if (!userId) {
      console.log('[PopupRecharge] userId 不可用，跳过检查');
      return;
    }

    try {
      // 1. 获取弹窗充值配置
      const res = await API.get('/api/user/promo_popup/config');
      if (!res.data?.success) {
        console.log('[PopupRecharge] 获取配置失败:', res.data);
        return;
      }

      const cfg = res.data.data;
      if (!cfg.enabled) {
        console.log('[PopupRecharge] 弹窗未启用');
        return;
      }

      setConfig(cfg);

      // 2. 检查是否首次进入控制台（首次登录触发）
      const firstLoginKey = `popup_recharge_first_login_${userId}`;
      if (!localStorage.getItem(firstLoginKey)) {
        console.log('[PopupRecharge] 首次进入控制台触发弹窗');
        localStorage.setItem(firstLoginKey, 'true');
        setVisible(true);
        return;
      }

      // 3. 检查低余额触发（余额 < 0.2 USD，当天关闭过则不再弹出）
      const userQuota = currentUserState?.user?.quota || 0;
      const quotaPerUnit =
        currentStatusState?.status?.quota_per_unit || 500000;
      const balanceInUSD = userQuota / quotaPerUnit;

      if (balanceInUSD < 0.2) {
        // 检查当天是否已被用户手动关闭过
        const dismissKey = `popup_recharge_dismissed_${userId}`;
        const dismissedDate = localStorage.getItem(dismissKey);
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        if (dismissedDate === today) {
          console.log('[PopupRecharge] 低余额但今天已关闭过，不再弹窗');
          return;
        }

        console.log(
          '[PopupRecharge] 低余额触发弹窗, balance:',
          balanceInUSD,
        );
        setVisible(true);
        return;
      }

      console.log('[PopupRecharge] 所有条件均不满足，不弹窗');
    } catch (error) {
      console.error('[PopupRecharge] 检查弹窗充值失败:', error);
    }
  }, []); // 无依赖 — 通过 ref 读取最新 state，checkAndShow 引用永远稳定

  const close = useCallback(() => {
    // 记录当天日期，当天内不再因低余额弹窗
    const userId = userStateRef.current?.user?.id;
    if (userId) {
      const dismissKey = `popup_recharge_dismissed_${userId}`;
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      localStorage.setItem(dismissKey, today);
    }
    setVisible(false);
  }, []);

  return { visible, config, checkAndShow, close };
};

export default usePopupRecharge;
