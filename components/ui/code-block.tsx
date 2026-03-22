import { useEffect, useRef, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";

interface CodeBlockProps {
	code: string;
	language: string;
	className?: string;
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ["github-dark", "github-light"],
			langs: ["tsx", "vue", "svelte", "html"],
		});
	}
	return highlighterPromise;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
	const [html, setHtml] = useState<string>("");
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;

		getHighlighter()
			.then((highlighter) => {
				if (!isMounted.current) return;
				try {
					const result = highlighter.codeToHtml(code, {
						lang: language,
						themes: { dark: "github-dark", light: "github-light" },
					});
					setHtml(result);
				} catch {
					// Language not supported or other error — stay on plain fallback
					setHtml("");
				}
			})
			.catch(() => {
				// Highlighter failed to load — stay on plain fallback
			});

		return () => {
			isMounted.current = false;
		};
	}, [code, language]);

	if (!html) {
		// Fallback: plain text while highlighter loads or on error
		return (
			<pre className={className} dir="ltr">
				<code>{code}</code>
			</pre>
		);
	}

	return (
		<div
			className={className}
			dir="ltr"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
