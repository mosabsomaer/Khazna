export interface BaseEntity {
	id: string;
	name: string;
	logoUrl: string;
	logoUrlBlack?: string;
	logomarkUrl?: string;
	logomarkUrlBlack?: string;
	colors: string[];
	isNew?: boolean;
	isUpdated?: boolean;
	figmaUrl?: string;
	/** When true, black/white color modes are not offered for this entity. */
	disableMono?: boolean;
}

export interface Bank extends BaseEntity {
	hasScreenshots: boolean;
	website?: string;
	type: "bank";
}

export interface PaymentMethod extends BaseEntity {
	type: "payment_method";
}

export interface Screenshot {
	id: string;
	url: string;
	downloadUrl: string;
	label: string;
	category: "onboarding" | "dashboard" | "transaction" | "settings" | "auth";
}

export type SelectedItem = Bank | PaymentMethod | null;

export type LogoVariant = "mono" | "branded" | "logomark";

export type ColorMode = "colored" | "black" | "white";

export type LogoStyle = "branded" | "logomark";

export type Theme = "light" | "dark";

export interface UIContextType {
	selectedItem: SelectedItem;
	setSelectedItem: (item: SelectedItem) => void;
	isSidebarOpen: boolean;
	closeSidebar: () => void;
	/** Derived from colorMode + logoStyle for backward-compatible filter checks */
	logoVariant: LogoVariant;
	colorMode: ColorMode;
	setColorMode: (mode: ColorMode) => void;
	logoStyle: LogoStyle;
	setLogoStyle: (style: LogoStyle) => void;
	getLogoUrl: (item: BaseEntity) => string;
	getPreviewLogoUrl: (item: BaseEntity) => string;
	hasMonoAsset: (item: BaseEntity) => boolean;
	theme: Theme;
	toggleTheme: (originRect?: DOMRect) => void;
	soundEnabled: boolean;
	toggleSound: () => void;
}
