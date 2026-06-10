import { Alert, Text } from "@mantine/core";
import { useTournamentStatus } from "../hooks/useTournamentStatus";
import { Info } from "lucide-react";

const tournamentStatusMap = {
	groupPredictions: {
		desc: "Group stage predictions are open!",
		nextPhaseDesc: "until predictions close and the group stage matches begin.",
	},
	groupPlaying: {
		desc: "Group stage matches are underway!",
		nextPhaseDesc: "until the group stage ends and knockout predictions open.",
	},
	knockoutPredictions: {
		desc: "Knockout stage predictions are now open!",
		nextPhaseDesc:
			"until knockout predictions lock and the final matches begin",
	},
	knockoutPlaying: {
		desc: "The knockout stage is live!",
		nextPhaseDesc: "",
	},
	pending: {
		desc: "Loading tournament details...",
		nextPhaseDesc: "",
	},
	error: {
		desc: "Failed to load tournament data. Please refresh the page.",
		nextPhaseDesc: "",
	},
};

export function TournamentStatusAlert() {
	const { status, timeLeft } = useTournamentStatus();

	return (
		<Alert
			icon={<Info />}
			color="blue"
			styles={{ title: { fontSize: "1rem", lineHeight: 1.25 } }}
			title={tournamentStatusMap[status].desc}
		>
			<Text component="span" fw="bold">
				{timeLeft}
			</Text>{" "}
			{tournamentStatusMap[status].nextPhaseDesc}
		</Alert>
	);
}
