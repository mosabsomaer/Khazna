import { ArrowUpRight, BookOpen, Mail } from "lucide-react";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { TeamSection } from "../components/ui/team-section";
import { BANKS, SOCIAL_LINKS } from "../constants";

export function AboutPage(): JSX.Element {
	const { t } = useTranslation();

	const teamMembers = [
		{
			id: 1,
			name: t("team.sara.name"),
			role: t("team.sara.role"),
			quote: t("team.sara.quote"),
			imageSrc: "/founders/Sara.webp",
			url: "https://www.linkedin.com/in/sara-s-35545b305/",
		},
		{
			id: 2,
			name: t("team.mosab.name"),
			role: t("team.mosab.role"),
			quote: t("team.mosab.quote"),
			imageSrc: "/founders/Mosab.webp",
			url: "https://www.linkedin.com/in/mosab-omaer-763b18232/",
		},
		{
			id: 3,
			name: t("team.moaad.name"),
			role: t("team.moaad.role"),
			quote: t("team.moaad.quote"),
			imageSrc: "/founders/Moo.webp",
			url: "https://www.linkedin.com/in/moaadalnaeli/",
		},
	];

	return (
		<div className="py-8 md:py-12">
			{/* Hero — what is Khazna */}
			<div className="mb-4">
				<span className="inline-block text-xs font-semibold uppercase tracking-widest text-muted-subtle mb-4">
					{t("about.eyebrow")}
				</span>
				<h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 max-w-2xl leading-tight">
					{t("about.title")}
				</h1>
				<p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-4">
					{t("about.description")}
				</p>
				<p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
					{t("about.description2")}
				</p>
			</div>

			{/* Meet the Team */}
			<div id="team">
				<TeamSection
					title={t("team.title")}
					subtitle={t("team.subtitle")}
					members={teamMembers}
				/>
			</div>

			{/* Join the Community */}
			<div className="relative bg-surface/40 border border-border/60 rounded-3xl p-10 md:p-14 overflow-hidden mb-16">
				<div className="absolute -start-16 top-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -end-16 bottom-0 w-36 h-36 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

				<div className="relative z-10 flex flex-col items-center text-center">
					{/* App icons dock */}
					<div className="flex items-center gap-1.5 p-2 rounded-2xl bg-elevated/80 border border-border/60 shadow-lg mb-8">
						{BANKS.slice(0, 5).map((bank) => (
							<div
								key={bank.id}
								className="w-10 h-10 rounded-xl overflow-hidden bg-surface border border-border-subtle"
							>
								<img
									src={bank.logomarkUrl}
									alt={bank.name}
									className="w-full h-full object-cover"
								/>
							</div>
						))}
					</div>

					<h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
						{t("contributors.missingSomething")}
					</h3>
					<p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
						{t("contributors.contributeDescription")}
					</p>

					<div className="flex flex-wrap items-center justify-center gap-3">
						<a
							href={SOCIAL_LINKS.email}
							className="inline-flex items-center gap-2 px-6 py-3 bg-accent-bg hover:opacity-90 text-accent-text rounded-full text-sm font-bold transition-colors"
						>
							<Mail size={16} />
							{t("contributors.becomeContributor")}
						</a>
						<a
							href={SOCIAL_LINKS.github}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover border border-border text-primary rounded-full text-sm font-bold transition-colors"
						>
							{t("contributors.viewOnGithub")}
							<ArrowUpRight size={16} />
						</a>
						<Link
							to="/contributing"
							className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover border border-border text-primary rounded-full text-sm font-bold transition-colors"
						>
							<BookOpen size={16} />
							{t("contributors.contributingGuide")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
