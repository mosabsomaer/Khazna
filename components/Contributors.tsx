import { Command, Keyboard } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextMarquee } from "./TextMarquee";

const ROLE_KEYS = [
	"developer",
	"uiDesigner",
	"coder",
	"graphicDesigner",
	"contentManager",
	"designer",
	"brandDesigner",
] as const;

export function Contributors(): JSX.Element {
	const { t } = useTranslation();
	const [shortcut, setShortcut] = useState({ key: "CTRL", symbol: "D" });
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isMac = userAgent.includes("mac");
		const isIOS = /iphone|ipad|ipod/.test(userAgent);
		const isAndroid = userAgent.includes("android");

		if (isMac) {
			setShortcut({ key: "CMD", symbol: "D" });
		}

		if (isIOS || isAndroid) {
			setIsMobile(true);
		}
	}, []);

	return (
		<section className=" border-t border-border/50 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-transparent to-elevated/50 pointer-events-none" />

			<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Save / Bookmark CTA — spacious centered section */}
				<div className="py-24 flex flex-col items-center justify-center text-center bg-background">
					<p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
						{t("contributors.followLine1")}
					</p>
					<div className="flex items-center gap-1.5 text-lg md:text-xl leading-relaxed text-muted-foreground">
						<span>{t("contributors.followLine2")}</span>
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
								{shortcut.key === "CMD" ? (
									<Command size={12} className="me-1" />
								) : (
									<Keyboard size={12} className="me-1" />
								)}
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
								{t("contributors.tapShare")}
							</span>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
