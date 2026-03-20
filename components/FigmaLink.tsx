import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FigmaLinkProps {
  href: string;
  tooltipPosition?: 'top' | 'bottom';
  className?: string;
}

export function FigmaLink({ href, tooltipPosition = 'bottom', className = '' }: FigmaLinkProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle hover:bg-surface-hover hover:border-border transition-all ${className}`}
          >
            <img src="/Figma_logo.svg" alt="Figma" className="w-4 h-4" />
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary uppercase tracking-wide">
              {t('figma.figma')}
            </span>
          </a>
        </TooltipTrigger>
        <TooltipContent side={tooltipPosition}>
          <p>{t('figma.viewOnFigma')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
