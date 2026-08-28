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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Typography } from '@douyinfe/semi-ui';
import { IconAlertTriangle } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/User';

const { Text } = Typography;

const QUOTA_EXHAUSTED_EVENT = 'quota-exhausted';

const QuotaExhaustedModal = () => {
  const [userState] = useContext(UserContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiTriggered, setApiTriggered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const quota = userState?.user?.quota;
  const isQuotaExhausted = typeof quota === 'number' && quota <= 0;
  const isConsoleRoute = location.pathname.startsWith('/console');
  const isTopUpPage = location.pathname === '/console/topup';

  useEffect(() => {
    const handleQuotaExhausted = () => {
      setDismissed(false);
      setApiTriggered(true);
    };

    window.addEventListener(QUOTA_EXHAUSTED_EVENT, handleQuotaExhausted);
    return () => {
      window.removeEventListener(QUOTA_EXHAUSTED_EVENT, handleQuotaExhausted);
    };
  }, []);

  useEffect(() => {
    if (!isQuotaExhausted) {
      setDismissed(false);
      setApiTriggered(false);
    }
  }, [isQuotaExhausted]);

  useEffect(() => {
    if (isTopUpPage) {
      setApiTriggered(false);
    }
  }, [isTopUpPage]);

  const visible = useMemo(() => {
    return (
      isConsoleRoute &&
      !isTopUpPage &&
      !dismissed &&
      (isQuotaExhausted || apiTriggered)
    );
  }, [apiTriggered, dismissed, isConsoleRoute, isQuotaExhausted, isTopUpPage]);

  const handleClose = () => {
    setDismissed(true);
    setApiTriggered(false);
  };

  const handleTopUp = () => {
    setDismissed(true);
    setApiTriggered(false);
    navigate('/console/topup');
  };

  return (
    <Modal
      title={t('额度已经用完')}
      visible={visible}
      onCancel={handleClose}
      closeOnEsc={false}
      maskClosable={false}
      footer={
        <Button type='primary' theme='solid' onClick={handleTopUp}>
          {t('立即充值')}
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <IconAlertTriangle size='extra-large' style={{ color: '#f59e0b' }} />
        <Text>{t('您的额度已经用完，请充值后继续使用服务。')}</Text>
      </div>
    </Modal>
  );
};

export default QuotaExhaustedModal;
