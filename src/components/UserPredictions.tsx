import { useMemo } from "react";
import {
	Flex,
	Loader,
	Paper,
	Title,
	Stack,
	Badge,
	Text,
	Center,
	Tabs,
	Box,
} from "@mantine/core";
import { Check, X } from "lucide-react";
import { useGroupPredictions } from "../api_hooks/useGroupPredictions";
import { useKnockoutPredictions } from "../api_hooks/useKnockoutPredictions";
import { useKnockoutMatches } from "../api_hooks/useKnockoutMatches";
import { useGroups } from "../api_hooks/useGroups";
import { useTournamentStatus } from "../hooks/useTournamentStatus";
import type { IGroupPrediction, ITeam } from "../types";
import {
	buildPredictionsFromSaved,
	buildRounds,
	buildTeamsMap,
	getRoundName,
	getTeamsForMatch,
} from "../utils/knockoutBracket";
import { getTeamCelebration, getTeamFlagUrl } from "../data/teamCelebrations";

function GroupPredictionsPanel({ profileId }: { profileId: string }) {
	const { data, isPending } = useGroupPredictions(profileId);
	const { data: groupsWithTeams, isLoading: groupsLoading } = useGroups();

	const groupPredictions = data?.reduce<Record<string, IGroupPrediction[]>>(
		(acc, item) => {
			if (!acc[item.group_id]) {
				acc[item.group_id] = [];
			}
			acc[item.group_id].push(item);
			return acc;
		},
		{},
	);

	if (isPending || groupsLoading) {
		return (
			<Center h={200}>
				<Loader size="lg" />
			</Center>
		);
	}

	if (!data?.length) {
		return <Text mt="md">No group predictions yet.</Text>;
	}

	return (
		<Flex direction="column" gap="8px" mt="md">
			{groupsWithTeams?.map((group) => {
				const teamPredictions =
					groupPredictions?.[group.id]?.sort(
						(a, b) => a.predicted_position - b.predicted_position,
					) || [];

				if (teamPredictions.length === 0) {
					return null;
				}

				return (
					<Paper withBorder bdrs="md" p="sm" key={group.id}>
						<Title
							className="lohko-title"
							style={{ userSelect: "none" }}
							order={2}
							size="sm"
							mb="md"
						>
							Group {group.name}
						</Title>

						<Stack bdrs="md" align="stretch" justify="center" gap="8px">
							{teamPredictions.map((item, index) => {
								const teamName =
									group.teams.find((t) => t.id === item.team_id)?.name ||
									"Unknown Team";
								return (
									<Flex key={item.team_id} align="center" gap="8px">
										<Badge
											size="lg"
											variant="filled"
											color={
												index <= 1 || item.is_third_place_qualified
													? "green"
													: "red"
											}
										>
											{index + 1}.
										</Badge>
										<Text style={{ userSelect: "none" }} fw="bold">
											{teamName}
										</Text>
									</Flex>
								);
							})}
						</Stack>
					</Paper>
				);
			})}
		</Flex>
	);
}

function TeamRow({
	team,
	isWinner,
}: {
	team: ITeam | undefined;
	isWinner: boolean;
}) {
	return (
		<Flex
			align="center"
			gap="xs"
			p="xs"
			style={{
				borderRadius: 8,
				backgroundColor: isWinner
					? "rgba(124, 58, 237, 0.12)"
					: "rgba(255, 255, 255, 0.02)",
				border: isWinner
					? "1px solid var(--wc-purple)"
					: "1px solid rgba(255, 255, 255, 0.06)",
			}}
		>
			{isWinner ? (
				<Check size={16} color="var(--wc-purple)" />
			) : (
				<X size={16} color="rgba(255, 255, 255, 0.2)" />
			)}
			<Text
				fw={isWinner ? 700 : 500}
				size="sm"
				style={{
					flex: 1,
					color: isWinner ? undefined : "rgba(255, 255, 255, 0.35)",
					opacity: team ? 1 : 0.5,
				}}
			>
				{team?.name ?? "TBD"}
			</Text>
		</Flex>
	);
}

function KnockoutPredictionsPanel({ profileId }: { profileId: string }) {
	const { data: savedPredictions, isPending: predictionsLoading } =
		useKnockoutPredictions(profileId);
	const { data: knockoutMatches, isLoading: matchesLoading } =
		useKnockoutMatches();

	const rounds = useMemo(
		() => buildRounds(knockoutMatches ?? []),
		[knockoutMatches],
	);

	const allTeamsMap = useMemo(
		() => buildTeamsMap(knockoutMatches ?? []),
		[knockoutMatches],
	);

	const predictions = useMemo(
		() => buildPredictionsFromSaved(rounds, savedPredictions ?? []),
		[rounds, savedPredictions],
	);

	const reversedRounds = useMemo(
		() =>
			rounds.map((matches, roundIndex) => ({ matches, roundIndex })).reverse(),
		[rounds],
	);

	const championTeam = useMemo(() => {
		const finalRound = rounds.at(-1);
		if (!finalRound?.length) return undefined;

		const winnerId = predictions[finalRound[0].id];
		return winnerId ? allTeamsMap.get(winnerId) : undefined;
	}, [rounds, predictions, allTeamsMap]);

	if (predictionsLoading || matchesLoading) {
		return (
			<Center h={200}>
				<Loader size="lg" />
			</Center>
		);
	}

	if (!savedPredictions?.length) {
		return <Text mt="md">No knockout predictions yet.</Text>;
	}

	const celebration = championTeam
		? getTeamCelebration(championTeam.short_name)
		: undefined;
	const championFlagUrl = championTeam
		? getTeamFlagUrl(championTeam.short_name)
		: undefined;

	return (
		<Stack gap="md" mt="md">
			{championTeam && celebration && championFlagUrl && (
				<Box p="md" ta="center">
					<img
						src={championFlagUrl}
						alt={`${celebration.name} flag`}
						style={{
							width: "min(200px, 70vw)",
							borderRadius: 12,
							boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						}}
					/>
					<Text fw={700} size="lg" mt="md">
						{championTeam.name}
					</Text>
					<Text c="dimmed" size="sm" mt={4}>
						{celebration.anecdote}
					</Text>
				</Box>
			)}

			{reversedRounds.map(({ matches, roundIndex }) => (
				<Paper key={roundIndex} withBorder bdrs="md" p="sm">
					<Flex align="center" gap="sm" mb="sm">
						<Title order={3} size="sm" className="lohko-title">
							{getRoundName(matches.length)}
						</Title>
					</Flex>

					<Stack gap="sm">
						{matches.map((match, matchIndex) => {
							const { home, away } = getTeamsForMatch(
								rounds,
								roundIndex,
								matchIndex,
								match,
								predictions,
								allTeamsMap,
							);
							const winnerId = predictions[match.id];

							return (
								<Stack gap={4}>
									<TeamRow
										team={home}
										isWinner={!!home && winnerId === home.id}
									/>

									<TeamRow
										team={away}
										isWinner={!!away && winnerId === away.id}
									/>
								</Stack>
							);
						})}
					</Stack>
				</Paper>
			))}
		</Stack>
	);
}

function getDefaultTab(
	status: ReturnType<typeof useTournamentStatus>["status"],
) {
	if (status === "knockoutPredictions" || status === "knockoutPlaying") {
		return "knockout";
	}
	return "group";
}

export function UserPredictions({
	profile,
}: {
	profile: { id: string; nickname: string };
}) {
	const { status } = useTournamentStatus();
	const defaultTab = getDefaultTab(status);

	return (
		<Tabs defaultValue={defaultTab} keepMounted={false}>
			<Tabs.List grow>
				<Tabs.Tab value="group">Group stage</Tabs.Tab>
				<Tabs.Tab value="knockout">Knockout stage</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="group">
				<GroupPredictionsPanel profileId={profile.id} />
			</Tabs.Panel>

			<Tabs.Panel value="knockout">
				<KnockoutPredictionsPanel profileId={profile.id} />
			</Tabs.Panel>
		</Tabs>
	);
}
