
import type { JSX } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Contributors } from './components/Contributors';
import { Navbar } from './components/Navbar';
import { DetailPanel } from './components/DetailPanel';
import { useUIContext } from './hooks/useUIContext';
import { AppDetailPage } from './pages/AppDetailPage';
import { AppsPage } from './pages/AppsPage';
import { HomePage } from './pages/HomePage';
import { BaseEntity, LogoVariant, SelectedItem, Theme, UIContextType } from './types';

export const UIContext = createContext<UIContextType | null>(null);

function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { closeSidebar } = useUIContext();
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <div className="min-h-screen bg-background text-primary">
      <Navbar />
      <div className="relative transition-all duration-300 flex-1 flex flex-col">
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
          {children}
        </main>
        <Contributors />
      </div>
      <DetailPanel />
    </div>
  );
}

function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App(): JSX.Element {
  const [selectedItem, setSelectedItemState] = useState<SelectedItem>(null);
  const [logoVariant, setLogoVariant] = useState<LogoVariant>('branded');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('khazna-theme') as Theme) || 'light';
  });

  const slideRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const isSidebarOpen = !!selectedItem;

  const setSelectedItem = useCallback((item: SelectedItem) => {
    setSelectedItemState(item);
  }, []);

  const closeSidebar = useCallback(() => {
    setSelectedItemState(null);
  }, []);

  const getLogoUrl = useCallback((item: BaseEntity): string => {
    if (logoVariant === 'logomark' && item.logomarkUrl) return item.logomarkUrl;
    return item.logoUrl;
  }, [logoVariant]);

  // Sync theme class to <html> and localStorage
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('khazna-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const el = slideRef.current;
    if (!el) {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
      isAnimating.current = false;
      return;
    }

    // Set the block color to the INCOMING theme's background
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    el.style.backgroundColor = nextTheme === 'dark' ? '#080808' : '#ffffff';

    // Phase 1: cover
    el.className = 'slide-block phase-cover';

    const onCoverEnd = () => {
      el.removeEventListener('animationend', onCoverEnd);
      // Switch theme at midpoint
      setTheme(nextTheme);

      // Phase 2: reveal
      requestAnimationFrame(() => {
        el.className = 'slide-block phase-reveal';

        const onRevealEnd = () => {
          el.removeEventListener('animationend', onRevealEnd);
          el.className = 'slide-block';
          isAnimating.current = false;
        };
        el.addEventListener('animationend', onRevealEnd);
      });
    };
    el.addEventListener('animationend', onCoverEnd);
  }, [theme]);

  const contextValue = useMemo<UIContextType>(() => ({
    selectedItem,
    setSelectedItem,
    isSidebarOpen,
    closeSidebar,
    logoVariant,
    setLogoVariant,
    getLogoUrl,
    theme,
    toggleTheme,
  }), [selectedItem, isSidebarOpen, setSelectedItem, closeSidebar, logoVariant, getLogoUrl, theme, toggleTheme]);

  return (
    <UIContext.Provider value={contextValue}>
      <MemoryRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/apps/:bankId" element={<AppDetailPage />} />
          </Routes>
        </Layout>
      </MemoryRouter>
      <div ref={slideRef} className="slide-block" />
    </UIContext.Provider>
  );
}

export default App;
