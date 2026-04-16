import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { html as contributingHtml } from "../CONTRIBUTING.md";

export function ContributingPage(): JSX.Element {
	const { t } = useTranslation();

	return (
		<div className="py-8 md:py-12">
			<Link
				to="/"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
			>
				<ArrowLeft size={16} />
				{t("common.back")}
			</Link>

			<article
				className="prose prose-neutral dark:prose-invert max-w-none"
				dir="ltr"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: compiled at build time from trusted local markdown
				dangerouslySetInnerHTML={{ __html: contributingHtml }}
			/>
		</div>
	);
}
