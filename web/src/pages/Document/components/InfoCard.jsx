import React from 'react';
import { IconInfoCircle, IconAlertTriangle, IconTickCircle } from '@douyinfe/semi-icons';

const styles = {
  info: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: <IconInfoCircle className="text-blue-500" />,
    title: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: <IconAlertTriangle className="text-amber-500" />,
    title: 'text-amber-700 dark:text-amber-300',
  },
  success: {
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-green-50 dark:bg-green-950/30',
    icon: <IconTickCircle className="text-green-500" />,
    title: 'text-green-700 dark:text-green-300',
  },
};

const InfoCard = ({ type = 'info', title, children }) => {
  const s = styles[type] || styles.info;
  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} p-4 my-4`}>
      <div className={`flex items-center gap-2 font-semibold mb-2 ${s.title}`}>
        {s.icon}
        <span>{title}</span>
      </div>
      <div className="text-sm text-semi-color-text-1 leading-relaxed">{children}</div>
    </div>
  );
};

export default InfoCard;
