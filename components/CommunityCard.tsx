
import { ArrowUpRight } from 'lucide-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { BANKS, SOCIAL_LINKS } from '../constants';

export function CommunityCard(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="relative bg-surface/40 border border-border/60 rounded-3xl p-10 md:p-14 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -start-16 top-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -end-16 bottom-0 w-36 h-36 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* App icons dock */}
        <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-elevated/80 border border-border/60 shadow-lg mb-8">
          {BANKS.slice(0, 5).map((bank) => (
            <div key={bank.id} className="w-10 h-10 rounded-xl overflow-hidden bg-surface border border-border-subtle">
              <img src={bank.logomarkUrl} alt={bank.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('contributors.missingSomething')}</h3>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
          {t('contributors.contributeDescription')}
        </p>

        <div className="flex items-center gap-3">
          <a
            href={SOCIAL_LINKS.email}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-bg hover:opacity-90 text-accent-text rounded-full text-sm font-bold transition-colors"
          >
            {t('contributors.becomeContributor')}
          </a>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover border border-border text-primary rounded-full text-sm font-bold transition-colors"
          >
            {t('contributors.viewOnGithub')}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
