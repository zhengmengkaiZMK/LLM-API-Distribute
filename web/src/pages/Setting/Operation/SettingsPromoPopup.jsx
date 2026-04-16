import React, { useEffect, useState, useRef } from 'react';
import { Button, Col, Form, Row, Spin, Typography } from '@douyinfe/semi-ui';
import {
  compareObjects,
  API,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';

export default function SettingsPromoPopup(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    'promo_popup_setting.enabled': false,
    'promo_popup_setting.amount': 100,
    'promo_popup_setting.discount': 1.0,
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

    // 校验折扣范围
    const discount = inputs['promo_popup_setting.discount'];
    if (discount < 0.1 || discount > 1.0) {
      return showError(t('折扣必须在 0.1 到 1.0 之间'));
    }

    // 校验金额
    const amount = inputs['promo_popup_setting.amount'];
    if (amount < 1) {
      return showError(t('充值金额必须大于 0'));
    }

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
        if (key === 'promo_popup_setting.enabled') {
          currentInputs[key] =
            props.options[key] === true ||
            props.options[key] === 'true' ||
            props.options[key] === '1';
        } else {
          currentInputs[key] = Number(props.options[key]) || inputs[key];
        }
      }
    }
    if (Object.keys(currentInputs).length > 0) {
      setInputs(currentInputs);
      setInputsRow(structuredClone(currentInputs));
      refForm.current?.setValues(currentInputs);
    }
  }, [props.options]);

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
                '弹窗充值功能允许在用户首次登录或余额不足时展示限时促销弹窗，折扣与支付设置中的金额折扣完全独立',
              )}
            </Typography.Text>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'promo_popup_setting.enabled'}
                  label={t('启用弹窗充值')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                  onChange={handleFieldChange('promo_popup_setting.enabled')}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  field={'promo_popup_setting.amount'}
                  label={t('充值金额（元）')}
                  placeholder={t('弹窗展示的充值金额')}
                  onChange={handleFieldChange('promo_popup_setting.amount')}
                  min={1}
                  step={10}
                  disabled={!inputs['promo_popup_setting.enabled']}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  field={'promo_popup_setting.discount'}
                  label={t('折扣')}
                  placeholder={t('0.1~1.0，如 0.8 = 八折')}
                  onChange={handleFieldChange('promo_popup_setting.discount')}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  precision={2}
                  disabled={!inputs['promo_popup_setting.enabled']}
                  extraText={
                    inputs['promo_popup_setting.enabled']
                      ? t('折扣') +
                        ' ' +
                        inputs['promo_popup_setting.discount'] +
                        ' = ' +
                        t('即充值') +
                        ' ' +
                        inputs['promo_popup_setting.amount'] +
                        ' ' +
                        t('元实际支付') +
                        ' ' +
                        (
                          inputs['promo_popup_setting.amount'] *
                          inputs['promo_popup_setting.discount']
                        ).toFixed(2) +
                        ' ' +
                        t('元')
                      : ''
                  }
                />
              </Col>
            </Row>
            <Typography.Text
              type='warning'
              style={{ marginTop: 8, marginBottom: 12, display: 'block' }}
            >
              {t(
                '注意：此折扣仅用于弹窗促销，与支付设置中的金额折扣完全独立',
              )}
            </Typography.Text>
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
