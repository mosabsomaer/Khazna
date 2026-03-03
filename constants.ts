
import { Bank, PaymentMethod, Screenshot } from './types';

export const SOCIAL_LINKS = {
  github: "https://github.com",
  figma: "https://figma.com",
  email: "mailto:hello@khaznaui.com"
};

export const CONTRIBUTORS = [
  { id: "ahmed", name: "Ahmed Ali", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmed", url: "https://example.com/ahmed" },
  { id: "sara", name: "Sara Smith", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara", url: "https://example.com/sara" },
  { id: "omar", name: "Omar Khaleel", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omar", url: "https://example.com/omar" },
  { id: "huda", name: "Huda Ben", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Huda", url: "https://example.com/huda" },
  { id: "karim", name: "Karim Zayd", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Karim", url: "https://example.com/karim" },
];

export const BANKS: Bank[] = [
  {
    id: 'wahda-bank',
    name: 'Wahda Bank',
    logoUrl: '/logos/banks/wahda-bank.svg',
    logomarkUrl: '/logos/bank-icons/wahda-bank.svg',
    colors: ['#034694', '#27AAE2', '#1A75BC'],
    hasScreenshots: true,
    type: 'bank',
    figmaUrl: 'https://figma.com/file/wahda'
  },
  {
    id: 'sahara-bank',
    name: 'Sahara Bank',
    logoUrl: '/logos/banks/sahara-bank.svg',
    logomarkUrl: '/logos/bank-icons/sahara-bank.svg',
    colors: ['#002C4B', '#A77B18'],
    hasScreenshots: true,
    isNew: true,
    type: 'bank',
    figmaUrl: 'https://figma.com/file/sahara'
  },
  {
    id: 'yaqqen-bank',
    name: 'Yaqqen Bank',
    logoUrl: '/logos/banks/yaqqen-bank.svg',
    logomarkUrl: '/logos/bank-icons/yaqqen-bank.svg',
    colors: ['#C6872F', '#884B39'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'north-bank',
    name: 'North Africa Bank',
    logoUrl: '/logos/banks/north-bank.svg',
    logomarkUrl: '/logos/bank-icons/north-bank.svg',
    colors: ['#0055B8', '#E87200'],
    hasScreenshots: true,
    type: 'bank'
  },
  {
    id: 'bcd-bank',
    name: 'Commerce & Development Bank',
    logoUrl: '/logos/banks/bcd-bank.svg',
    logomarkUrl: '/logos/bank-icons/bcd-bank.svg',
    colors: ['#007F3E', '#FFC80F'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'atib-bank',
    name: 'ATIB Bank',
    logoUrl: '/logos/banks/atib-bank.svg',
    logomarkUrl: '/logos/bank-icons/atib-bank.svg',
    colors: ['#E30E2D'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'daman-islamic-bank',
    name: 'Daman Islamic Bank',
    logoUrl: '/logos/banks/daman-islamic-bank.svg',
    logomarkUrl: '/logos/bank-icons/daman-islamic-bank.svg',
    colors: ['#4338CA', '#6366F1'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'group-bank',
    name: 'Group Bank',
    logoUrl: '/logos/banks/group-bank.svg',
    logomarkUrl: '/logos/bank-icons/group-bank.svg',
    colors: ['#0CA9E8'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'investment-bank',
    name: 'Investment Bank',
    logoUrl: '/logos/banks/investment-bank.svg',
    logomarkUrl: '/logos/bank-icons/investment-bank.svg',
    colors: ['#DE4148'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'islamic-bank',
    name: 'Islamic Bank',
    logoUrl: '/logos/banks/islamic-bank.svg',
    logomarkUrl: '/logos/bank-icons/islamic-bank.svg',
    colors: ['#735D46', '#897852'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'tadamun-bank',
    name: 'Tadamun Bank',
    logoUrl: '/logos/banks/tadamun-bank.svg',
    logomarkUrl: '/logos/bank-icons/tadamun-bank.svg',
    colors: ['#155957', '#21B5E9', '#B5D339'],
    hasScreenshots: false,
    type: 'bank'
  },
  {
    id: 'united-bank',
    name: 'United Bank',
    logoUrl: '/logos/banks/united-bank.svg',
    logomarkUrl: '/logos/bank-icons/united-bank.svg',
    colors: ['#304365'],
    hasScreenshots: false,
    type: 'bank'
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'sadad',
    name: 'Sadad',
    logoUrl: '/logos/payment-methods/sadad.svg',
    colors: ['#67696B'],
    type: 'payment_method',
    figmaUrl: 'https://figma.com/file/sadad'
  },
  {
    id: 'edfa3li',
    name: 'Edfa3li',
    logoUrl: '/logos/payment-methods/edfa3li.svg',
    colors: ['#0E2316', '#FEE600'],
    type: 'payment_method'
  },
  {
    id: 'mobicash',
    name: 'MobiCash',
    logoUrl: '/logos/payment-methods/mobicash.svg',
    colors: ['#009448', '#E86724'],
    isUpdated: true,
    type: 'payment_method'
  },
  {
    id: 'masrafy-pay',
    name: 'Masrafy Pay',
    logoUrl: '/logos/payment-methods/masrafy-pay.svg',
    colors: ['#165FAB', '#39BDEE'],
    type: 'payment_method'
  },
  {
    id: 'masrafy-plus',
    name: 'Masrafy Plus',
    logoUrl: '/logos/payment-methods/masrafy-plus.svg',
    colors: ['#165FAB', '#39BDEE'],
    type: 'payment_method'
  },
  {
    id: 'ly-pay',
    name: 'LY Pay',
    logoUrl: '/logos/payment-methods/ly-pay.svg',
    colors: ['#17A3DD', '#4EB3A7'],
    type: 'payment_method'
  },
  {
    id: 'al-seraj-pay',
    name: 'Al Seraj Pay',
    logoUrl: '/logos/payment-methods/al-seraj-pay.svg',
    colors: ['#1F1F4E', '#6C56A2'],
    type: 'payment_method'
  },
  {
    id: 'mobimal',
    name: 'MobiMal',
    logoUrl: '/logos/payment-methods/mobimal.svg',
    colors: ['#3582A0', '#3E4E86'],
    type: 'payment_method'
  },
  {
    id: 'nab4pay',
    name: 'NAB4Pay',
    logoUrl: '/logos/payment-methods/nab4pay.svg',
    colors: ['#2D84C6', '#F59F1C'],
    type: 'payment_method'
  },
  {
    id: 'onepay',
    name: 'OnePay',
    logoUrl: '/logos/payment-methods/onepay.svg',
    colors: ['#026795', '#49C4EA'],
    type: 'payment_method'
  },
  {
    id: 'sahara-pay',
    name: 'Sahara Pay',
    logoUrl: '/logos/payment-methods/sahara-pay.svg',
    colors: ['#162C49', '#A47C2C'],
    type: 'payment_method'
  },
  {
    id: 'tlync',
    name: 'Tlync',
    logoUrl: '/logos/payment-methods/tlync.svg',
    colors: ['#3E2FBB'],
    type: 'payment_method'
  },
  {
    id: 'yussor-pay',
    name: 'Yussor Pay',
    logoUrl: '/logos/payment-methods/yussor-pay.svg',
    colors: ['#013E50', '#057A40'],
    isNew: false,
    type: 'payment_method'
  },
];

export const MOCK_SCREENSHOTS: Record<string, Screenshot[]> = {
  'wahda-bank': [
    { id: '1', url: 'https://picsum.photos/seed/wahda1/400/800', label: 'Login', category: 'auth' },
    { id: '2', url: 'https://picsum.photos/seed/wahda2/400/800', label: 'Accounts', category: 'dashboard' },
  ],
  'sahara-bank': [
    { id: '1', url: 'https://picsum.photos/seed/sahara1/400/800', label: 'Welcome', category: 'onboarding' },
    { id: '2', url: 'https://picsum.photos/seed/sahara2/400/800', label: 'Card Details', category: 'dashboard' },
    { id: '3', url: 'https://picsum.photos/seed/sahara3/400/800', label: 'Profile', category: 'settings' },
  ],
  'north-bank': [
    { id: '1', url: 'https://picsum.photos/seed/north1/400/800', label: 'Splash Screen', category: 'onboarding' },
    { id: '2', url: 'https://picsum.photos/seed/north2/400/800', label: 'Login', category: 'auth' },
    { id: '3', url: 'https://picsum.photos/seed/north3/400/800', label: 'Home Dashboard', category: 'dashboard' },
    { id: '4', url: 'https://picsum.photos/seed/north4/400/800', label: 'Transfer', category: 'transaction' },
    { id: '5', url: 'https://picsum.photos/seed/north5/400/800', label: 'Settings', category: 'settings' },
  ],
};
