
import { Check, Copy, Download, FileCode, Image as ImageIcon, LayoutGrid, Loader2, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIContext } from '../hooks/useUIContext';
import { convertSvgToImage, downloadBlob } from '../utils/download';
import { generateCode } from '../utils/generators';
import { FigmaLink } from './FigmaLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const MOCK_SVG_CONTENT = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function ColorPill({ color }: { color: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  function handleCopy(): void {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 600);
  }

  const isLight = useMemo(() => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }, [color]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center px-4 py-2 rounded-full border border-white/10 shadow-sm transition-all hover:scale-105 active:scale-95"
      style={{ backgroundColor: color }}
      title={t('common.clickToCopy')}
    >
      <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-black/80' : 'text-white'}`}>
        {copied ? t('common.copied') : color}
      </span>
    </button>
  );
}

function makeMonoSvg(svg: string): string {
  return svg
    .replace(/fill="(?!none)[^"]*"/g, 'fill="white"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="white"');
}

export function DetailPanel(): JSX.Element | null {
  const { selectedItem, isSidebarOpen, closeSidebar, logoVariant, getLogoUrl } = useUIContext();
  const { t } = useTranslation();
  const [codeFormat, setCodeFormat] = useState('React');
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const resolvedUrl = selectedItem ? getLogoUrl(selectedItem) : '';

  useEffect(() => {
    async function fetchSvg(): Promise<void> {
      if (!resolvedUrl) return;

      try {
        if (resolvedUrl.endsWith('.svg')) {
          const response = await fetch(resolvedUrl);
          const text = await response.text();
          setSvgContent(text);
        } else {
          setSvgContent(MOCK_SVG_CONTENT);
        }
      } catch (err) {
        console.error('Failed to fetch SVG', err);
        setSvgContent(MOCK_SVG_CONTENT);
      }
    }

    fetchSvg();
    setCopied(false);
    setIsProcessing(null);
  }, [resolvedUrl]);

  const activeSvg = useMemo(() => {
    if (!svgContent) return '';
    return logoVariant === 'mono' ? makeMonoSvg(svgContent) : svgContent;
  }, [svgContent, logoVariant]);

  const generatedCode = useMemo(() => {
    if (!activeSvg || !selectedItem) return '';
    return generateCode(codeFormat, activeSvg, selectedItem.name);
  }, [activeSvg, codeFormat, selectedItem]);

  function handleCopy(): void {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 600);
  }

  async function handleDownload(format: string): Promise<void> {
    if (!selectedItem || !activeSvg || isProcessing) return;

    setIsProcessing(format);
    const variantSuffix = logoVariant !== 'branded' ? `-${logoVariant}` : '';
    const filename = `${selectedItem.id}-${selectedItem.name.toLowerCase().replace(/\s+/g, '-')}${variantSuffix}`;

    try {
      if (format === 'SVG') {
        const blob = new Blob([activeSvg], { type: 'image/svg+xml' });
        downloadBlob(blob, `${filename}.svg`);
      } else {
        const mimeType = format === 'PNG' ? 'image/png' : 'image/webp';
        const dataUrl = await convertSvgToImage(activeSvg, 1024, 1024, mimeType);
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        downloadBlob(blob, `${filename}.${format.toLowerCase()}`);
      }
    } catch (e) {
      console.error('Download failed', e);
      alert(t('sidebar.downloadFailed'));
    } finally {
      setIsProcessing(null);
    }
  }

  if (!isSidebarOpen) return null;

  return (
    <aside className={`
      fixed inset-y-0 end-0 z-50
      w-full md:w-[400px]
      bg-background border-s border-border
      transform transition-transform duration-300 ease-in-out
      flex flex-col shadow-2xl shadow-black
      ${isSidebarOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'}
    `}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur z-10">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wider flex items-center gap-2">
          <LayoutGrid size={14} /> {t('sidebar.details')}
        </h2>
        <button
          onClick={closeSidebar}
          className="p-2 text-muted-subtle hover:text-primary hover:bg-surface-hover rounded-full transition-colors outline-none focus:bg-surface-hover"
        >
          <X size={20} />
        </button>
      </div>

      {selectedItem ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Preview Area */}
          <div className="relative aspect-square w-full border-b border-border bg-surface/50 flex items-center justify-center p-12 overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`
                 }}
            />

            <img
              src={resolvedUrl}
              alt={t('entityNames.' + selectedItem.id)}
              className={`relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
                logoVariant === 'mono' ? 'brightness-0 dark:invert' : ''
              }`}
            />
          </div>

          <div className="p-6 space-y-8">
            {/* Info Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-primary">{t('entityNames.' + selectedItem.id)}</h1>
                {selectedItem.figmaUrl && (
                  <FigmaLink href={selectedItem.figmaUrl} tooltipPosition="bottom" className="bg-surface-hover/50" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedItem.colors.map((color, idx) => (
                  <ColorPill key={idx} color={color} />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="download">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="download"
                  className="flex-1 rounded-none border-b-2 border-transparent pb-3 pt-0 px-0 text-sm font-medium text-muted-subtle shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground gap-2"
                >
                  <ImageIcon size={16} /> {t('sidebar.assets')}
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="flex-1 rounded-none border-b-2 border-transparent pb-3 pt-0 px-0 text-sm font-medium text-muted-subtle shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground gap-2"
                >
                  <FileCode size={16} /> {t('sidebar.code')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="download" className="mt-6">
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {['SVG', 'PNG', 'WebP'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(fmt)}
                      disabled={!!isProcessing}
                      className="group w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-surface/30 hover:bg-surface hover:border-border-subtle active:scale-[0.98] transition-all duration-200 outline-none focus:ring-1 focus:ring-ring"
                    >
                      <span className="text-sm font-medium text-dim group-hover:text-primary transition-colors">
                        {fmt}
                      </span>

                      <div className="text-dim group-hover:text-primary transition-colors">
                        {isProcessing === fmt ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-6">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-4 gap-2">
                    {['React', 'Vue', 'Svelte', 'HTML'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setCodeFormat(fmt)}
                        className={`
                          py-2 text-[10px] sm:text-xs font-medium rounded-lg border transition-all duration-200
                          ${codeFormat === fmt
                            ? 'bg-accent-bg text-accent border-accent-bg shadow-lg'
                            : 'bg-transparent text-dim border-border hover:border-border-subtle hover:bg-surface'}
                        `}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <div
                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-border bg-elevated"
                    onClick={handleCopy}
                  >
                    <pre className="p-4 font-mono text-xs text-dim overflow-x-auto h-64 custom-scrollbar leading-relaxed">
                      <code>{generatedCode}</code>
                    </pre>

                    <div className={`
                        absolute inset-0 bg-elevated/80 backdrop-blur-[2px]
                        flex items-center justify-center gap-2
                        transition-opacity duration-200
                        ${copied ? 'opacity-100 bg-emerald-500/20' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                      {copied ? (
                        <>
                          <Check size={20} className="text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">{t('common.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={20} className="text-primary" />
                          <span className="text-primary font-semibold">{t('common.clickToCopy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-subtle">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 ring-1 ring-border">
            <LayoutGrid size={24} className="opacity-50" />
          </div>
          <p className="text-sm font-medium text-muted">{t('sidebar.noLogoSelected')}</p>
          <p className="text-xs text-dim mt-1">{t('sidebar.selectFromGrid')}</p>
        </div>
      )}
    </aside>
  );
}
