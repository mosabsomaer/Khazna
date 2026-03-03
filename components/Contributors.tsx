
import { ArrowUpRight, Bookmark, Command, FolderInput, Keyboard } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTRIBUTORS, SOCIAL_LINKS } from '../constants';

export function Contributors(): JSX.Element {
  const { t } = useTranslation();
  const [shortcut, setShortcut] = useState({ key: 'CTRL', symbol: 'D' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes('mac');
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = userAgent.includes('android');

    if (isMac) {
      setShortcut({ key: 'CMD', symbol: 'D' });
    }

    if (isIOS || isAndroid) {
      setIsMobile(true);
    }
  }, []);

  return (
    <section className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-elevated/50 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Contributors */}
        <div className="flex flex-col items-center justify-center mb-16">
          <p className="text-muted-subtle text-sm font-medium mb-6 uppercase tracking-wider">{t('contributors.contributors')}</p>

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

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bookmark Card */}
          <div className="relative bg-surface/40 border border-border/60 rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-900/20">
                <Bookmark size={24} />
              </div>

              <h3 className="text-2xl font-bold text-primary mb-3">{t('contributors.dontLoseThis')}</h3>
              <p className="text-muted leading-relaxed mb-8 max-w-md">
                {t('contributors.bookmarkDescription')}
              </p>

              <div className="mt-auto flex items-center gap-3">
                {!isMobile ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border text-xs font-mono text-muted-subtle">
                    {shortcut.key === 'CMD' ? <Command size={12} className="me-1"/> : <Keyboard size={12} className="me-1"/>}
                    <span className="bg-surface-hover px-1.5 rounded text-muted border border-border-subtle min-w-[30px] text-center">
                      {shortcut.key}
                    </span>
                    <span>+</span>
                    <span className="bg-surface-hover px-1.5 rounded text-muted border border-border-subtle min-w-[20px] text-center">
                      {shortcut.symbol}
                    </span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated border border-border text-xs text-muted-subtle">
                    {t('contributors.tapShare')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contribute Card */}
          <div className="relative bg-surface/40 border border-border/60 rounded-3xl p-8 md:p-10 overflow-hidden">
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-border-subtle text-primary flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <FolderInput size={24} />
              </div>

              <h3 className="text-2xl font-bold text-primary mb-3">{t('contributors.missingSomething')}</h3>
              <p className="text-muted leading-relaxed mb-8 max-w-md">
                {t('contributors.contributeDescription')}
              </p>

              <a
                href={SOCIAL_LINKS.email}
                className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-accent-bg hover:opacity-90 text-accent-text rounded-full text-sm font-bold transition-colors"
              >
                {t('contributors.becomeContributor')}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
