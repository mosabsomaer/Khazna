
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../components/Badge';
import { BANKS, PAYMENT_METHODS } from '../constants';
import { useUIContext } from '../hooks/useUIContext';
import { LogoVariant } from '../types';

type Category = 'banks' | 'payment_methods';

export function HomePage(): JSX.Element {
  const { setSelectedItem, selectedItem, logoVariant, setLogoVariant, getLogoUrl } = useUIContext();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('banks');
  const [logoSize, setLogoSize] = useState(100);

  const items = activeCategory === 'banks' ? BANKS : PAYMENT_METHODS;

  const categories: { key: Category; labelKey: string; count: number }[] = [
    { key: 'banks', labelKey: 'home.banks', count: BANKS.length },
    { key: 'payment_methods', labelKey: 'home.paymentMethods', count: PAYMENT_METHODS.length },
  ];

  const variants: { key: LogoVariant; labelKey: string }[] = [
    { key: 'mono', labelKey: 'home.mono' },
    { key: 'branded', labelKey: 'home.branded' },
    { key: 'logomark', labelKey: 'home.logomark' },
  ];

  return (
    <div className="pb-8">
      <div className="py-12 border-b border-border/50">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('home.title')}</h1>
        <p className="text-muted max-w-2xl">
          {t('home.description')}
        </p>
      </div>

      {/* Toolbar: Category Tabs | Size Slider | Style Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4 border-b border-border">
        {/* Category Tabs */}
        <div className="flex items-center gap-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${activeCategory === cat.key
                  ? 'text-primary'
                  : 'text-muted-subtle hover:text-muted'
                }
              `}
            >
              {t(cat.labelKey)}
              <span className={`
                text-xs px-2 py-0.5 rounded-md font-medium
                ${activeCategory === cat.key
                  ? 'bg-surface-hover text-primary'
                  : 'text-dim'
                }
              `}>
                {cat.count}
              </span>
              {activeCategory === cat.key && (
                <div className="absolute bottom-0 start-0 end-0 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Size Slider (center) */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted">{t('home.size')}</span>
          <input
            type="range"
            min="100"
            max="200"
            value={logoSize}
            onChange={(e) => setLogoSize(Number(e.target.value))}
            className="range-slider w-48"
          />
          <span className="text-sm font-bold text-muted tabular-nums w-8 text-end">{logoSize}</span>
        </div>

        {/* Style Toggle */}
        <div className="flex items-center bg-surface rounded-lg border border-border p-1 self-start lg:self-auto">
          {variants.map(v => (
            <button
              key={v.key}
              onClick={() => setLogoVariant(v.key)}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all
                ${logoVariant === v.key
                  ? 'bg-surface-hover text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
                }
              `}
            >
              {t(v.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Grid */}
      <div className="border border-border rounded-xl overflow-hidden mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map(item => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`
                  relative flex flex-col items-center justify-center gap-3
                  border-e border-b border-border
                  p-6 transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? 'bg-surface ring-1 ring-inset ring-muted-subtle'
                    : 'bg-background hover:bg-surface/60'
                  }
                `}
                style={{ aspectRatio: '1 / 1' }}
              >
                {/* Badges */}
                {(item.isNew || item.isUpdated) && (
                  <div className="absolute top-3 start-3 flex gap-1">
                    {item.isNew && <Badge type="new" />}
                    {item.isUpdated && !item.isNew && <Badge type="updated" />}
                  </div>
                )}

                {/* Logo */}
                <img
                  src={getLogoUrl(item)}
                  alt={t('entityNames.' + item.id)}
                  className={`object-contain transition-all duration-200 ${
                    logoVariant === 'mono' ? 'brightness-0 dark:invert' : ''
                  }`}
                  style={{
                    width: `${logoSize}px`,
                    height: `${logoSize}px`,
                  }}
                />

                {/* Name */}
                <span className="text-xs text-muted-subtle font-medium truncate w-full text-center">{t('entityNames.' + item.id)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
