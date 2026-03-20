
import { ArrowUpRight, Command, Keyboard } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BANKS, SOCIAL_LINKS } from '../constants';
import { TextMarquee } from './text-marquee';
import { TestimonialSection } from './ui/testimonials';

const ROLE_KEYS = ['developer', 'uiDesigner', 'coder', 'graphicDesigner', 'contentManager', 'designer', 'brandDesigner'] as const;

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

  const testimonials = [
    {
      id: 1,
      name: t('testimonials.sara.name'),
      role: t('testimonials.sara.role'),
      quote: t('testimonials.sara.quote'),
      imageSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=face',
      url: 'https://www.linkedin.com/in/sara-s-35545b305/',
    },
    {
      id: 2,
      name: t('testimonials.mosab.name'),
      role: t('testimonials.mosab.role'),
      quote: t('testimonials.mosab.quote'),
      imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
      url: 'https://www.linkedin.com/in/mosab-omaer-763b18232/',
    },
    {
      id: 3,
      name: t('testimonials.moaad.name'),
      role: t('testimonials.moaad.role'),
      quote: t('testimonials.moaad.quote'),
      imageSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=face',
      url: 'https://www.linkedin.com/in/moaadalnaeli/',
    },
  ];

  return (
    <section className=" border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-elevated/50 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Testimonials */}
        <TestimonialSection
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
          testimonials={testimonials}
        />

        {/* Community Card */}
        <div className="relative bg-surface/40 border border-border/60 rounded-3xl p-10 md:p-14 overflow-hidden mb-6">
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

        {/* Save / Bookmark CTA — spacious centered section */}
        <div className="h-screen flex flex-col items-center justify-center text-center bg-background">
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            {t('contributors.followLine1')}
          </p>
          <div className="flex items-center gap-1.5 text-lg md:text-xl leading-relaxed text-muted-foreground">
            <span>{t('contributors.followLine2')}</span>
            <TextMarquee height={40} speed={1.1} className="inline-flex">
              {ROLE_KEYS.map((key) => (
                <span key={key} className="text-primary whitespace-nowrap">
                  {t(`contributors.roles.${key}`)}
                </span>
              ))}
            </TextMarquee>
          </div>

          <div className="mt-16">
            {!isMobile ? (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-xs font-mono text-muted-subtle">
                {shortcut.key === 'CMD' ? <Command size={12} className="me-1"/> : <Keyboard size={12} className="me-1"/>}
                <span className="bg-surface-hover px-2 py-0.5 rounded text-muted-foreground border border-border-subtle min-w-[30px] text-center">
                  {shortcut.key}
                </span>
                <span>+</span>
                <span className="bg-surface-hover px-2 py-0.5 rounded text-muted-foreground border border-border-subtle min-w-[20px] text-center">
                  {shortcut.symbol}
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs text-muted-subtle">
                {t('contributors.tapShare')}
              </span>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
