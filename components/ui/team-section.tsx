import { motion } from "framer-motion";
import { Quote } from "lucide-react";

// TypeScript interface for a single team member object
interface TeamMember {
	id: number;
	quote: string;
	name: string;
	role: string;
	imageSrc: string;
	url?: string;
}

// TypeScript interface for the component's props
interface TeamSectionProps {
	title: string;
	subtitle: string;
	members: TeamMember[];
}

/**
 * A responsive section component to display team members.
 * It features a title, subtitle, and a grid of animated team member cards.
 */
export const TeamSection = ({ title, subtitle, members }: TeamSectionProps) => {
	// Animation variants for the container to orchestrate staggered children animations
	const containerVariants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	// Animation variants for each team member card
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	return (
		<section className="w-full py-16 sm:py-24">
			<div className="container mx-auto max-w-6xl px-4 text-center">
				{/* Section Header */}
				<h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h2>
				<p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>

				{/* Team Members Grid */}
				<motion.div
					className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
				>
					{members.map((member) => (
						<motion.a
							key={member.id}
							href={member.url}
							target="_blank"
							rel="noopener noreferrer"
							className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm cursor-pointer block"
							variants={itemVariants}
						>
							<div className="relative">
								<img
									src={member.imageSrc}
									alt={member.name}
									className="h-120 w-full object-cover"
								/>
								{/* Gradient overlay for text readability */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
							</div>

							{/* Content within the card */}
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
						</motion.a>
					))}
				</motion.div>
			</div>
		</section>
	);
};
