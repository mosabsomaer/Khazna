
export type ItemType = 'bank' | 'payment_method';

export interface BaseEntity {
  id: string;
  name: string;
  logoUrl: string;
  logomarkUrl?: string;
  colors: string[];
  isNew?: boolean;
  isUpdated?: boolean;
  figmaUrl?: string;
}

export interface Bank extends BaseEntity {
  hasScreenshots: boolean;
  website?: string;
  type: 'bank';
}

export interface PaymentMethod extends BaseEntity {
  type: 'payment_method';
}

export interface Screenshot {
  id: string;
  url: string;
  label: string;
  category: 'onboarding' | 'dashboard' | 'transaction' | 'settings' | 'auth';
}

export type SelectedItem = Bank | PaymentMethod | null;

export type LogoVariant = 'mono' | 'branded' | 'logomark';

export type Theme = 'light' | 'dark';

export interface UIContextType {
  selectedItem: SelectedItem;
  setSelectedItem: (item: SelectedItem) => void;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  logoVariant: LogoVariant;
  setLogoVariant: (variant: LogoVariant) => void;
  getLogoUrl: (item: BaseEntity) => string;
  theme: Theme;
  toggleTheme: () => void;
}
