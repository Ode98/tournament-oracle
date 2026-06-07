import { Text } from "@mantine/core";
import { useAuth } from "./AuthProvider";
import { Navigate } from "@tanstack/react-router";
import { useGroups } from "../api_hooks/useGroups";
import { useGroupPredictions } from "../api_hooks/useGroupPredictions";
import { Header } from "./Header";
import { GroupPrediction } from "./GroupPrediction";

export function Dashboard() {
	const { user, loading } = useAuth();
	const { data: groups, isLoading: groupsLoading } = useGroups();
	const { data: savedGroupPredictions, isLoading: groupPredictionsLoading } =
		useGroupPredictions(user?.id);

	if (loading || groupsLoading || groupPredictionsLoading) {
		return <Text ta="center">Loading...</Text>;
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	if (!groups || groups.length === 0) {
		return null;
	}

	return (
		<>
			<Header />
			<GroupPrediction
				savedGroupPredictions={savedGroupPredictions ?? []}
				groupsWithTeams={groups}
				profileId={user.id}
			/>
		</>
	);
}
