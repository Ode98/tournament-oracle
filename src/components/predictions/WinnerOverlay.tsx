import { useEffect, useState } from "react";
import { Box, Text } from "@mantine/core";
import {
	getTeamCelebration,
	getTeamFlagUrl,
} from "../../data/teamCelebrations";

const ANIMATION_MS = 400;

const keyframes = `
@keyframes winnerOverlayFadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes winnerOverlayFadeOut {
	from { opacity: 1; }
	to { opacity: 0; }
}
@keyframes winnerOverlayPopIn {
	from { transform: scale(0.7); opacity: 0; }
	to { transform: scale(1); opacity: 1; }
}
@keyframes winnerOverlayPopOut {
	from { transform: scale(1); opacity: 1; }
	to { transform: scale(0.7); opacity: 0; }
}
`;

export function WinnerOverlay({
	open,
	onClose,
	teamCode,
	autoCloseMs = 3000,
}: {
	open: boolean;
	onClose: () => void;
	teamCode?: string;
	autoCloseMs?: number;
}) {
	const [shouldRender, setShouldRender] = useState(open);
	const [isClosing, setIsClosing] = useState(false);

	const celebration = teamCode ? getTeamCelebration(teamCode) : undefined;
	const flagUrl = teamCode ? getTeamFlagUrl(teamCode) : undefined;

	useEffect(() => {
		if (open) {
			setShouldRender(true);
			setIsClosing(false);
		} else if (shouldRender) {
			setIsClosing(true);
		}
	}, [open, shouldRender]);

	useEffect(() => {
		if (!open) return;
		const timer = setTimeout(onClose, autoCloseMs);
		return () => clearTimeout(timer);
	}, [open, autoCloseMs, onClose]);

	const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
		if (e.target !== e.currentTarget || !isClosing) return;
		setShouldRender(false);
		setIsClosing(false);
	};

	if (!shouldRender || !celebration || !flagUrl) return null;

	const popAnimation = isClosing
		? `winnerOverlayPopOut ${ANIMATION_MS}ms ease forwards`
		: `winnerOverlayPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;

	return (
		<Box
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "1.5rem",
				backdropFilter: "blur(12px)",
				backgroundColor: "rgba(0,0,0,0.55)",
				animation: isClosing
					? `winnerOverlayFadeOut ${ANIMATION_MS}ms ease forwards`
					: "winnerOverlayFadeIn 0.4s ease",
			}}
			onClick={onClose}
			onAnimationEnd={handleAnimationEnd}
		>
			<style>{keyframes}</style>
			<img
				src={flagUrl}
				alt={`${celebration.name} Flag`}
				style={{
					width: "min(320px, 80vw)",
					borderRadius: "12px",
					boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
					animation: popAnimation,
				}}
			/>
			<Text
				fw={900}
				size="xl"
				ta="center"
				px="md"
				style={{
					color: "white",
					letterSpacing: "0.05em",
					textShadow: "0 2px 16px rgba(0,0,0,0.6)",
					animation: isClosing
						? popAnimation
						: "winnerOverlayPopIn 0.6s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both",
				}}
			>
				{celebration.anecdote}
			</Text>
		</Box>
	);
}
