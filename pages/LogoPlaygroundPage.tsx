import type { JSX } from "react";
import { useState } from "react";
import { BcdBankLogo } from "../components/logos/BcdBankLogo";
import type { ColorMode, LogoStyle } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type MonoColorMode = "black" | "white";

interface ControlGroupProps {
	label: string;
	children: React.ReactNode;
}

interface ToggleButtonProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ControlGroup({ label, children }: ControlGroupProps): JSX.Element {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
				{label}
			</span>
			<div className="flex gap-2">{children}</div>
		</div>
	);
}

function ToggleButton({ active, onClick, children }: ToggleButtonProps): JSX.Element {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
				active
					? "bg-primary text-background border-primary"
					: "bg-surface text-muted-foreground border-border hover:border-border-subtle hover:text-primary"
			}`}
		>
			{children}
		</button>
	);
}

// ─── Preview card ─────────────────────────────────────────────────────────────

interface PreviewCardProps {
	label: string;
	colorMode: ColorMode;
	variant: LogoStyle;
	size: number;
}

function PreviewCard({ label, colorMode, variant, size }: PreviewCardProps): JSX.Element {
	const isDark = colorMode === "white";

	const monoColor: string =
		colorMode === "black" ? "black" : colorMode === "white" ? "white" : "inherit";

	return (
		<div className="flex flex-col gap-3">
			<div
				className={`rounded-2xl border flex items-center justify-center p-8 transition-colors duration-200 ${
					isDark
						? "bg-zinc-900 border-zinc-700"
						: "bg-surface border-border"
				}`}
			>
				{colorMode === "colored" ? (
					/* Colored mode — use the real branded <img> asset */
					<img
						src={variant === "logomark" ? "/logos/bank-icons/bcd-bank.svg" : "/logos/banks/bcd-bank.svg"}
						alt="BCD Bank"
						style={{ height: size, width: "auto" }}
					/>
				) : (
					/* Mono mode — inline SVG component, color driven by CSS */
					<BcdBankLogo
						variant={variant}
						size={size}
						style={{ color: monoColor } as React.CSSProperties}
					/>
				)}
			</div>
			<p className="text-xs text-center text-muted-subtle font-mono">{label}</p>
		</div>
	);
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LogoPlaygroundPage(): JSX.Element {
	const [variant, setVariant] = useState<LogoStyle>("branded");
	const [colorMode, setColorMode] = useState<ColorMode>("colored");
	const [size, setSize] = useState<number>(48);

	const monoColor: string = colorMode === "white" ? "white" : "black";
	const isDarkPreview = colorMode === "white";

	return (
		<div className="pb-24">
			{/* Header */}
			<div className="py-12 border-b border-border/50">
				<p className="text-xs font-semibold text-muted-subtle uppercase tracking-widest mb-2">
					POC · Inline SVG Logos
				</p>
				<h1 className="text-3xl font-bold text-primary mb-2">Logo Playground</h1>
				<p className="text-muted-foreground max-w-xl">
					Proof of concept for the mono SVG component system. One SVG file drives all four
					mono variants — branded/logomark × black/white — via{" "}
					<code className="text-xs bg-surface border border-border rounded px-1.5 py-0.5">
						currentColor
					</code>{" "}
					and conditional group rendering.
				</p>
			</div>

			<div className="pt-10 flex flex-col gap-16">
				{/* ── Controls ───────────────────────────────────────────── */}
				<section className="flex flex-wrap gap-8 items-end">
					<ControlGroup label="Variant">
						<ToggleButton active={variant === "branded"} onClick={() => setVariant("branded")}>
							Branded
						</ToggleButton>
						<ToggleButton active={variant === "logomark"} onClick={() => setVariant("logomark")}>
							Logomark
						</ToggleButton>
					</ControlGroup>

					<ControlGroup label="Color mode">
						<ToggleButton active={colorMode === "colored"} onClick={() => setColorMode("colored")}>
							Colored
						</ToggleButton>
						<ToggleButton active={colorMode === "black"} onClick={() => setColorMode("black")}>
							Black
						</ToggleButton>
						<ToggleButton active={colorMode === "white"} onClick={() => setColorMode("white")}>
							White
						</ToggleButton>
					</ControlGroup>

					<ControlGroup label={`Size — ${size}px`}>
						<input
							type="range"
							min={24}
							max={120}
							value={size}
							onChange={(e) => setSize(Number(e.target.value))}
							className="w-32 accent-primary"
						/>
					</ControlGroup>
				</section>

				{/* ── Live preview ──────────────────────────────────────── */}
				<section>
					<h2 className="text-xs font-semibold text-muted-subtle uppercase tracking-widest mb-6">
						Live preview
					</h2>
					<div
						className={`rounded-3xl border flex items-center justify-center p-16 transition-colors duration-200 ${
							isDarkPreview ? "bg-zinc-900 border-zinc-700" : "bg-surface border-border"
						}`}
					>
						{colorMode === "colored" ? (
							<img
								src={
									variant === "logomark"
										? "/logos/bank-icons/bcd-bank.svg"
										: "/logos/banks/bcd-bank.svg"
								}
								alt="BCD Bank"
								style={{ height: size * 2, width: "auto" }}
							/>
						) : (
							<BcdBankLogo
								variant={variant}
								size={size * 2}
								style={{ color: monoColor } as React.CSSProperties}
							/>
						)}
					</div>
				</section>

				{/* ── All 5 variants grid ───────────────────────────────── */}
				<section>
					<h2 className="text-xs font-semibold text-muted-subtle uppercase tracking-widest mb-6">
						All variants — one SVG component
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
						<PreviewCard label="colored · branded" colorMode="colored" variant="branded" size={size} />
						<PreviewCard label="colored · logomark" colorMode="colored" variant="logomark" size={size} />
						<PreviewCard label="black · branded" colorMode="black" variant="branded" size={size} />
						<PreviewCard label="black · logomark" colorMode="black" variant="logomark" size={size} />
						<PreviewCard label="white · branded" colorMode="white" variant="branded" size={size} />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
						<PreviewCard label="white · logomark" colorMode="white" variant="logomark" size={size} />
						{/* Empty slots to keep grid aligned */}
						<div />
						<div />
						<div />
						<div />
					</div>
				</section>

				{/* ── How it works ──────────────────────────────────────── */}
				<section className="border border-border rounded-2xl p-8">
					<h2 className="text-sm font-semibold text-primary mb-4">How it works</h2>
					<div className="grid md:grid-cols-3 gap-8 text-sm text-muted-foreground">
						<div>
							<p className="font-medium text-primary mb-1">1 file</p>
							<p>
								One <code className="text-xs bg-surface border border-border rounded px-1 py-0.5">BcdBankLogo.tsx</code> handles all 6 display states. No{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">*-black.svg</code> /
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">*-white.svg</code> duplicates.
							</p>
						</div>
						<div>
							<p className="font-medium text-primary mb-1">currentColor</p>
							<p>
								All SVG paths use{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">fill="currentColor"</code>.
								Setting{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">color: black</code> or{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">color: white</code>{" "}
								on the SVG propagates instantly.
							</p>
						</div>
						<div>
							<p className="font-medium text-primary mb-1">Conditional groups</p>
							<p>
								The{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">#wordmark</code>{" "}
								group is only rendered when{" "}
								<code className="text-xs bg-surface border border-border rounded px-1 py-0.5">variant="branded"</code>.
								The viewBox adjusts automatically.
							</p>
						</div>
					</div>
				</section>

				{/* ── Integration note ─────────────────────────────────── */}
				<section className="text-xs text-muted-subtle font-mono border border-dashed border-border rounded-2xl p-6 space-y-1">
					<p className="text-muted-foreground font-sans font-medium text-sm mb-3">
						Integration plan (once all 5 SVGs are authored)
					</p>
					<p>1. Add optional <span className="text-primary">MonoLogo</span> field to BaseEntity in types.ts</p>
					<p>2. Set it on the 5 entities: united-bank, bcd-bank, nuran-bank, edfa3li, sadad</p>
					<p>3. In DetailPanel / logo grid: if MonoLogo exists and colorMode !== 'colored', render component instead of &lt;img&gt;</p>
					<p>4. Colored mode always uses the existing logoUrl / logomarkUrl files — no changes there</p>
				</section>
			</div>
		</div>
	);
}
