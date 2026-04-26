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

import React, { useState } from 'react';
import { Button, Switch, Modal, Space } from '@douyinfe/semi-ui';

const UsersActions = ({
  setShowAddUser,
  enableBatchOperation,
  setEnableBatchOperation,
  selectedUsers,
  batchManageUsers,
  t,
}) => {
  // Add new user
  const handleAddUser = () => {
    setShowAddUser(true);
  };

  // Toggle batch operation mode
  const handleToggleBatch = (checked) => {
    setEnableBatchOperation(checked);
  };

  // Batch disable confirmation
  const handleBatchDisable = () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return;
    }
    Modal.warning({
      title: t('确认批量禁用'),
      content: t('确定要禁用选中的') + ` ${selectedUsers.length} ` + t('个用户吗？'),
      onOk: () => batchManageUsers('disable'),
      okText: t('确认禁用'),
      cancelText: t('取消'),
    });
  };

  // Batch enable confirmation
  const handleBatchEnable = () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return;
    }
    Modal.confirm({
      title: t('确认批量启用'),
      content: t('确定要启用选中的') + ` ${selectedUsers.length} ` + t('个用户吗？'),
      onOk: () => batchManageUsers('enable'),
      okText: t('确认启用'),
      cancelText: t('取消'),
    });
  };

  return (
    <div className='flex gap-2 w-full md:w-auto order-2 md:order-1 items-center flex-wrap'>
      <Button className='w-full md:w-auto' onClick={handleAddUser} size='small'>
        {t('添加用户')}
      </Button>
      <Space align='center'>
        <Switch
          size='small'
          checked={enableBatchOperation}
          onChange={handleToggleBatch}
          aria-label={t('批量操作')}
        />
        <span className='text-sm whitespace-nowrap'>{t('批量操作')}</span>
      </Space>
      {enableBatchOperation && (
        <>
          <Button
            className='w-full md:w-auto'
            type='warning'
            size='small'
            disabled={!selectedUsers || selectedUsers.length === 0}
            onClick={handleBatchDisable}
          >
            {t('批量禁用')}
            {selectedUsers && selectedUsers.length > 0 && ` (${selectedUsers.length})`}
          </Button>
          <Button
            className='w-full md:w-auto'
            size='small'
            disabled={!selectedUsers || selectedUsers.length === 0}
            onClick={handleBatchEnable}
          >
            {t('批量启用')}
            {selectedUsers && selectedUsers.length > 0 && ` (${selectedUsers.length})`}
          </Button>
        </>
      )}
    </div>
  );
};

export default UsersActions;
