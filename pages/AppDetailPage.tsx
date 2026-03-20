
import type { JSX } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, Download, X, Loader2, DownloadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BANKS, MOCK_SCREENSHOTS } from '../constants';
import { Screenshot } from '../types';
import JSZip from 'jszip';
import { downloadBlob } from '../utils/download';
import { FigmaLink } from '../components/FigmaLink';

export function AppDetailPage(): JSX.Element {
  const { bankId } = useParams<{ bankId: string }>();
  const { t } = useTranslation();
  const [selectedScreen, setSelectedScreen] = useState<Screenshot | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);

  const bank = BANKS.find(b => b.id === bankId);
  const screenshots = bankId ? MOCK_SCREENSHOTS[bankId] || [] : [];

  const navigateLightbox = useCallback((direction: 'next' | 'prev') => {
    if (!selectedScreen) return;
    const currentIndex = screenshots.findIndex(s => s.id === selectedScreen.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % screenshots.length
      : (currentIndex - 1 + screenshots.length) % screenshots.length;

    setSelectedScreen(screenshots[newIndex]);
  }, [selectedScreen, screenshots]);

  useEffect(() => {
    if (!selectedScreen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setSelectedScreen(null);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next');
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScreen, navigateLightbox]);

  const handleDownloadSingle = useCallback(async (screen: Screenshot) => {
    if (!bank) return;
    try {
      setIsDownloadingSingle(true);
      const response = await fetch(screen.url);
      const blob = await response.blob();
      const filename = `${bank.name.toLowerCase().replace(/\s+/g, '-')}-${screen.label.toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert(t('sidebar.downloadImageFailed'));
    } finally {
      setIsDownloadingSingle(false);
    }
  }, [bank, t]);

  const handleDownloadAll = useCallback(async () => {
    if (!bank || screenshots.length === 0) return;

    try {
      setIsDownloadingAll(true);
      const zip = new JSZip();
      const folder = zip.folder(bank.name.replace(/\s+/g, '-'));

      const promises = screenshots.map(async (screen) => {
        try {
          const response = await fetch(screen.url);
          const blob = await response.blob();
          const filename = `${screen.label.replace(/\s+/g, '-').toLowerCase()}.png`;
          folder?.file(filename, blob);
        } catch (err) {
          console.warn(`Failed to fetch ${screen.url}`, err);
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: 'blob' });
      const zipName = `${bank.name.toLowerCase().replace(/\s+/g, '-')}-ui-kit.zip`;
      downloadBlob(content, zipName);
    } catch (error) {
      console.error('Batch download failed:', error);
      alert(t('sidebar.zipFailed'));
    } finally {
      setIsDownloadingAll(false);
    }
  }, [bank, screenshots, t]);

  if (!bank) {
    return <Navigate to="/apps" replace />;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="py-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/apps"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-colors text-muted-foreground hover:text-primary"
            >
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-3">
              <img src={bank.logoUrl} alt={t('entityNames.' + bank.id)} className="w-10 h-10 rounded-lg bg-surface object-cover" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-primary">{t('entityNames.' + bank.id)}</h1>
                  {bank.figmaUrl && (
                    <FigmaLink href={bank.figmaUrl} tooltipPosition="top" className="bg-surface" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-subtle mt-1">
                  <span>{screenshots.length} {t('common.screens')}</span>

                  {screenshots.length > 0 && (
                    <>
                      <span>&bull;</span>
                      <button
                        onClick={handleDownloadAll}
                        disabled={isDownloadingAll}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                      >
                        {isDownloadingAll ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <DownloadCloud size={12} />
                        )}
                        {isDownloadingAll ? t('sidebar.zipping') : t('sidebar.downloadAll')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {screenshots.length > 0 ? (
          screenshots.map(screen => (
            <div key={screen.id} className="group flex flex-col gap-3">
              <button
                onClick={() => setSelectedScreen(screen)}
                className="relative aspect-[9/19] w-full rounded-2xl overflow-hidden border border-border bg-surface cursor-pointer outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                <img
                  src={screen.url}
                  alt={t('screenshotLabels.' + screen.label)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-black/60 rounded-full text-white shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                    <ZoomIn size={20} />
                  </div>
                </div>
              </button>
              <div className="text-center">
                <h3 className="text-sm font-medium text-muted-foreground">{t('screenshotLabels.' + screen.label)}</h3>
                <p className="text-[10px] text-muted-subtle uppercase tracking-wider mt-0.5">{t('screenshotCategories.' + screen.category)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-subtle">
            {t('apps.noScreenshotsBank')}
          </div>
        )}
      </div>

      {/* Lightbox - stays dark in both modes */}
      {selectedScreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedScreen(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
            className="absolute start-4 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors z-50 hidden md:block"
          >
            <ChevronLeft size={32} className="rtl:rotate-180" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors z-50 hidden md:block"
          >
            <ChevronRight size={32} className="rtl:rotate-180" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setSelectedScreen(null); }}
            className="absolute top-4 end-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors z-50"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div
              className="relative flex flex-col items-center gap-4 max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedScreen.url}
                alt={t('screenshotLabels.' + selectedScreen.label)}
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              />

              <div className="flex items-center gap-4 bg-zinc-900/80 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-white">{t('screenshotLabels.' + selectedScreen.label)}</h3>
                </div>

                <div className="h-4 w-px bg-zinc-700" />

                <button
                  onClick={() => handleDownloadSingle(selectedScreen)}
                  disabled={isDownloadingSingle}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isDownloadingSingle ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  {t('common.download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
