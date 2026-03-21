import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { TextMarquee } from "./text-marquee";

const ROLE_KEYS = [
	"coder",
	"developer",
	"designer",
	"contentCreator",
	"uiDesigner",
	"productDesigner",
	"frontendDev",
] as const;

export function FollowCTA(): JSX.Element {
	const { t } = useTranslation();

	return (
		<div className="relative bg-[#0a0a0a] rounded-3xl p-10 md:p-16 overflow-hidden mb-6">
			{/* Subtle grain / glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

			<div className="relative z-10 flex flex-col items-center text-center gap-1">
				<p className="text-[#a1a1aa] text-lg md:text-xl leading-relaxed">
					{t("contributors.followLine1")}
				</p>
				<p className="text-[#a1a1aa] text-lg md:text-xl leading-relaxed">
					{t("contributors.followLine2Prefix")}{" "}
					<TextMarquee height={30} speed={0.8} className="inline-flex">
						{ROLE_KEYS.map((key) => (
							<span key={key} className="text-white font-semibold">
								{t(`contributors.roles.${key}`)}
							</span>
						))}
					</TextMarquee>
					{t("contributors.followLine2Suffix")}
				</p>
			</div>
		</div>
	);
}
