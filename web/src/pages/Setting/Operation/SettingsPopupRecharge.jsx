import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
  Spin,
  Typography,
  Banner,
} from '@douyinfe/semi-ui';
import {
  compareObjects,
  API,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';

export default function SettingsPopupRecharge(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    'popup_recharge_setting.enabled': false,
    'popup_recharge_setting.amount': 100,
    'popup_recharge_setting.discount': 1.0,
  });
  const refForm = useRef();
  const [inputsRow, setInputsRow] = useState(inputs);

  function handleFieldChange(fieldName) {
    return (value) => {
      setInputs((inputs) => ({ ...inputs, [fieldName]: value }));
    };
  }

  function onSubmit() {
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      let value = String(inputs[item.key]);
      return API.put('/api/option/', {
        key: item.key,
        value,
      });
    });
    setLoading(true);
    Promise.all(requestQueue)
      .then((res) => {
        if (requestQueue.length === 1) {
          if (res.includes(undefined)) return;
        } else if (requestQueue.length > 1) {
          if (res.includes(undefined))
            return showError(t('部分保存失败，请重试'));
        }
        showSuccess(t('保存成功'));
        props.refresh();
      })
      .catch(() => {
        showError(t('保存失败，请重试'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const currentInputs = {};
    for (let key in props.options) {
      if (Object.keys(inputs).includes(key)) {
        currentInputs[key] = props.options[key];
      }
    }
    setInputs(currentInputs);
    setInputsRow(structuredClone(currentInputs));
    refForm.current?.setValues(currentInputs);
  }, [props.options]);

  // 用于预览展示
  const amount =
    parseFloat(inputs['popup_recharge_setting.amount']) || 100;
  const discount =
    parseFloat(inputs['popup_recharge_setting.discount']) || 1.0;
  const currentPrice = (amount * discount).toFixed(2);
  // 处理非整数折扣：如 0.65 → "6.5折"，0.8 → "8折"
  const discountDisplay = discount * 10;
  const discountText =
    discountDisplay % 1 === 0
      ? `${discountDisplay}`
      : `${discountDisplay.toFixed(1)}`;

  return (
    <>
      <Spin spinning={loading}>
        <Form
          values={inputs}
          getFormApi={(formAPI) => (refForm.current = formAPI)}
          style={{ marginBottom: 15 }}
        >
          <Form.Section text={t('弹窗充值管理')}>
            <Typography.Text
              type='tertiary'
              style={{ marginBottom: 16, display: 'block' }}
            >
              {t(
                '启用后，符合条件的用户将看到充值弹窗（首次登录/余额不足时）。弹窗折扣独立于充值设置中的金额折扣。',
              )}
            </Typography.Text>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'popup_recharge_setting.enabled'}
                  label={t('启用弹窗充值')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                  onChange={handleFieldChange(
                    'popup_recharge_setting.enabled',
                  )}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  field={'popup_recharge_setting.amount'}
                  label={t('充值金额（元）')}
                  placeholder={t(
                    '弹窗中展示的充值金额',
                  )}
                  onChange={handleFieldChange(
                    'popup_recharge_setting.amount',
                  )}
                  min={1}
                  max={10000}
                  disabled={!inputs['popup_recharge_setting.enabled']}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  field={'popup_recharge_setting.discount'}
                  label={t('折扣率')}
                  placeholder={t(
                    '0.8表示8折，0.65表示6.5折',
                  )}
                  onChange={handleFieldChange(
                    'popup_recharge_setting.discount',
                  )}
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  precision={2}
                  disabled={!inputs['popup_recharge_setting.enabled']}
                />
              </Col>
            </Row>

            {/* 折扣预览 */}
            <Banner
              type='info'
              style={{ marginTop: 12, marginBottom: 8 }}
              description={
                <span>
                  {t('弹窗预览：')}
                  {discount < 1 && (
                    <>
                      <span style={{ textDecoration: 'line-through' }}>
                        ¥{amount}
                      </span>
                      {' → '}
                    </>
                  )}
                  <strong style={{ color: 'var(--semi-color-danger)' }}>
                    ¥{currentPrice}
                  </strong>
                  {discount < 1 && (
                    <span style={{ color: 'var(--semi-color-text-2)' }}>
                      {' '}
                      ({discountText}
                      {t('折')})
                    </span>
                  )}
                </span>
              }
            />

            {/* 独立折扣说明 */}
            <Banner
              type='info'
              style={{ marginBottom: 12 }}
              description={t(
                '此折扣仅用于弹窗促销，与充值设置中的金额折扣完全独立。弹窗支付走专用接口，实际扣款金额由后端计算。',
              )}
            />

            <Row>
              <Button size='default' onClick={onSubmit}>
                {t('保存弹窗充值设置')}
              </Button>
            </Row>
          </Form.Section>
        </Form>
      </Spin>
    </>
  );
}
