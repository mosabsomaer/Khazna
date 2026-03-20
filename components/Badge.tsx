import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface BadgeProps {
  type: 'new' | 'updated';
  className?: string;
}

export function Badge({ type, className = '' }: BadgeProps): JSX.Element {
  const { t } = useTranslation();

  const styles = type === 'new'
    ? 'bg-accent-bg text-accent-text border-border font-semibold'
    : 'bg-surface-hover text-muted-foreground border-border-subtle';

  const label = type === 'new' ? t('badge.new') : t('badge.updated');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${styles} ${className}`}>
      {label}
    </span>
  );
}
