
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTRIBUTORS } from '../constants';

export function ContributorAvatars(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center mb-16">
      <p className="text-muted-subtle text-sm font-medium mb-6 uppercase tracking-wider">
        {t('contributors.contributors')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {CONTRIBUTORS.map((c, i) => (
          <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="group/avatar relative cursor-pointer">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-surface transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:border-border-subtle">
              <img src={c.avatar} alt={t('contributorNames.' + c.id)} className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all" />
            </div>
            <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-hover text-primary text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border-subtle">
              {t('contributorNames.' + c.id)}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
