import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CONTRIBUTORS } from "../constants";
import { cn } from "../lib/utils";
import type { Contributor } from "../types";

const initials = (name: string): string =>
	name
		.split(" ")
		.map((word) => word[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

// A hovered avatar lights up instantly but takes 15s to fade back, so the cursor leaves a lit trail.
const AVATAR_STATES = cn(
	"[transition:opacity_1s_ease-out_15s,scale_1s_ease-out_15s,filter_1s_ease-out_15s]",
	"pointer-fine:scale-90 pointer-fine:opacity-40 pointer-fine:grayscale pointer-fine:contrast-75",
	"pointer-fine:group-hover:scale-115 pointer-fine:group-hover:opacity-100 pointer-fine:group-hover:grayscale-0 pointer-fine:group-hover:contrast-100",
	"pointer-fine:group-focus-visible:scale-115 pointer-fine:group-focus-visible:opacity-100 pointer-fine:group-focus-visible:grayscale-0 pointer-fine:group-focus-visible:contrast-100",
	"pointer-fine:group-hover:[transition:opacity_0s,scale_0.05s_ease-out,filter_0s] pointer-fine:group-focus-visible:[transition:opacity_0s,scale_0.05s_ease-out,filter_0s]",
);

function Avatar({ contributor }: { contributor: Contributor }): JSX.Element {
	const { name, imageUrl, isLogo, url } = contributor;
	const face = (
		<span
			className={cn(
				"flex size-16 items-center justify-center overflow-hidden rounded-[30%] border border-border-subtle",
				isLogo ? "bg-white p-2.5" : "bg-elevated",
				AVATAR_STATES,
			)}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={name}
					loading="lazy"
					className={cn("size-full", isLogo ? "object-contain" : "object-cover")}
				/>
			) : (
				<span role="img" aria-label={name} className="text-lg font-bold text-muted-foreground">
					{initials(name)}
				</span>
			)}
		</span>
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{url ? (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={name}
						className="group rounded-[30%] p-1.5 outline-none"
					>
						{face}
					</a>
				) : (
					<span className="group rounded-[30%] p-1.5">{face}</span>
				)}
			</TooltipTrigger>
			<TooltipContent>{name}</TooltipContent>
		</Tooltip>
	);
}

export function Community(): JSX.Element {
	const { t } = useTranslation();

	return (
		<section className="border-t border-border/50 px-4 py-24 text-center sm:px-6 lg:px-8">
			<img
				src="/logo-only.svg"
				alt=""
				width={615}
				height={560}
				loading="lazy"
				className="pointer-events-none mx-auto h-auto w-32 invert dark:invert-0 md:w-40"
			/>
			<h2 className="mt-12 text-[clamp(2rem,6vw,4.5rem)] font-black leading-none text-primary">
				{t("contributors.communityTitle")}
				<br />
				<span className="font-light">{t("contributors.communitySubtitle")}</span>
			</h2>
			<p className="mt-10 text-lg font-light md:text-2xl">
				<Link
					to="/contributing"
					className="text-muted-foreground transition-colors hover:text-primary hover:underline"
				>
					{t("contributors.communityCta")}
				</Link>
			</p>
			<TooltipProvider delayDuration={0}>
				<div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center">
					{CONTRIBUTORS.map((contributor) => (
						<Avatar key={contributor.name} contributor={contributor} />
					))}
				</div>
			</TooltipProvider>
		</section>
	);
}
