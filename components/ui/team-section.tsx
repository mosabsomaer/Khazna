import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";

interface TeamMember {
	id: number;
	quote: string;
	name: string;
	role: string;
	imageSrc: string;
	url?: string;
}

interface TeamSectionProps {
	title: string;
	subtitle: string;
	members: TeamMember[];
}

export const TeamSection = ({ title, subtitle, members }: TeamSectionProps) => {
	const gridRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const node = gridRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="w-full py-16 sm:py-24">
			<div className="container mx-auto max-w-6xl px-4 text-center">
				<h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h2>
				<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>

				<div
					ref={gridRef}
					className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
				>
					{members.map((member, index) => (
						<a
							key={member.id}
							href={member.url}
							target="_blank"
							rel="noopener noreferrer"
							className={`relative block cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-500 ease-out motion-reduce:transition-none ${
								isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
							}`}
							style={{ transitionDelay: isVisible ? `${index * 200}ms` : "0ms" }}
						>
							<div className="relative">
								<img
									src={member.imageSrc}
									alt={member.name}
									className="h-120 w-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
							</div>

							<div className="absolute bottom-0 start-0 end-0 p-6 text-start text-white">
								<Quote className="mb-4 h-8 w-8 text-white/40" aria-hidden="true" />
								<blockquote className="text-base font-medium leading-relaxed">
									{member.quote}
								</blockquote>
								<figcaption className="mt-4">
									<p className="font-semibold">
										&mdash; {member.name},
										<span className="ms-1 text-white/60">{member.role}</span>
									</p>
								</figcaption>
							</div>
						</a>
					))}
				</div>
			</div>
		</section>
	);
};
