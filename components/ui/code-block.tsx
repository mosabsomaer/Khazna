interface CodeBlockProps {
	code: string;
	language?: string;
	className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
	return (
		<pre className={className} dir="ltr">
			<code>{code}</code>
		</pre>
	);
}
