import { LoadingOverlay } from "@mantine/core";
import { useAuth } from "./AuthProvider";
import { Navigate } from "@tanstack/react-router";
import { useGroups } from "../api_hooks/useGroups";
import { useGroupPredictions } from "../api_hooks/useGroupPredictions";
import { GroupPrediction } from "./GroupPrediction";

export function Predictions() {
	const { user, loading } = useAuth();
	const { data: groups, isLoading: groupsLoading } = useGroups();
	const { data: savedGroupPredictions, isLoading: groupPredictionsLoading } =
		useGroupPredictions(user?.id);

	if (loading || groupsLoading || groupPredictionsLoading) {
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

	if (!groups || groups.length === 0) {
		return null;
	}

	return (
		<GroupPrediction
			savedGroupPredictions={savedGroupPredictions ?? []}
			groupsWithTeams={groups}
			profileId={user.id}
		/>
	);
}
