import { LoadingOverlay } from "@mantine/core";
import { useAuth } from "../AuthProvider";
import { Navigate } from "@tanstack/react-router";
import { useKnockoutMatches } from "../../api_hooks/useKnockoutMatches";
import { useKnockoutPredictions } from "../../api_hooks/useKnockoutPredictions";
import { KnockoutPrediction } from "./KnockoutPrediction";

export function KnockoutPredictions() {
	const { user, loading } = useAuth();
	const { data: knockoutMatches, isLoading: knockoutMatchesLoading } =
		useKnockoutMatches();
	const {
		data: savedKnockoutPredictions,
		isLoading: savedKnockoutPredictionsFetching,
	} = useKnockoutPredictions(user?.id);

	if (loading || knockoutMatchesLoading || savedKnockoutPredictionsFetching) {
		return (
			<LoadingOverlay
				visible={true}
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	if (!knockoutMatches || knockoutMatches.length === 0) {
		return null;
	}

	return (
		<KnockoutPrediction
			savedKnockoutPredictions={savedKnockoutPredictions ?? []}
			knockoutMatches={knockoutMatches}
			profileId={user.id}
		/>
	);
}
