import { useState, useMemo, useEffect } from "react";
import {
	Alert,
	Button,
	Flex,
	Paper,
	SimpleGrid,
	Text,
	Checkbox,
	Box,
	Stepper,
} from "@mantine/core";
import type { IKnockoutMatch, IKnockoutPrediction } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTournamentStatus } from "../../hooks/useTournamentStatus";
import { supabase } from "../../utils/supabase";
import { WinnerOverlay } from "./WinnerOverlay";
import {
	buildPredictionsFromSaved,
	buildRounds,
	buildTeamsMap,
	getRoundName,
	getTeamsForMatch,
} from "../../utils/knockoutBracket";

export type IClientKnockoutPrediction = Omit<IKnockoutPrediction, "id">;

export function KnockoutPrediction({
	savedKnockoutPredictions,
	knockoutMatches,
	profileId,
}: {
	savedKnockoutPredictions: Array<IKnockoutPrediction>;
	knockoutMatches: Array<IKnockoutMatch>;
	profileId: string;
}) {
	const queryClient = useQueryClient();
	const { status } = useTournamentStatus();
	const isLocked = status !== "knockoutPredictions";
	const [currentStep, setCurrentStep] = useState(0);

	const rounds = useMemo(() => buildRounds(knockoutMatches), [knockoutMatches]);

	const allTeamsMap = useMemo(
		() => buildTeamsMap(knockoutMatches),
		[knockoutMatches],
	);

	const [predictions, setPredictions] = useState<Record<number, string>>(() =>
		buildPredictionsFromSaved(rounds, savedKnockoutPredictions),
	);

	const [syncedPredictions, setSyncedPredictions] = useState<
		Record<number, string>
	>(() => buildPredictionsFromSaved(rounds, savedKnockoutPredictions));

	useEffect(() => {
		setSyncedPredictions(
			buildPredictionsFromSaved(rounds, savedKnockoutPredictions),
		);
	}, [rounds, savedKnockoutPredictions]);

	const [isSaved, setIsSaved] = useState(false);

	const { mutate: savePredictions, isPending } = useMutation({
		mutationFn: async () => {
			const existingByRound: Record<string, typeof savedKnockoutPredictions> =
				{};
			savedKnockoutPredictions.forEach((p) => {
				if (!existingByRound[p.round]) existingByRound[p.round] = [];
				existingByRound[p.round].push({ ...p });
			});

			const payload = Object.entries(predictions).map(([matchId, winnerId]) => {
				let roundSize = 16;
				for (const round of rounds) {
					if (round.some((m) => m.id === Number(matchId))) {
						roundSize = round.length;
						break;
					}
				}
				const roundValue = String(roundSize * 2) as
					| "32"
					| "16"
					| "8"
					| "4"
					| "2";

				const existingList = existingByRound[roundValue] || [];
				const existingIndex = existingList.findIndex(
					(p) => p.predicted_winner_id === winnerId,
				);

				let existing;
				if (existingIndex !== -1) {
					existing = existingList.splice(existingIndex, 1)[0];
				} else {
					existing = existingList.pop();
				}

				return {
					...(existing ? { id: existing.id } : {}),
					predicted_winner_id: winnerId,
					profile_id: profileId,
					round: roundValue,
				};
			});

			// Handle any leftover unused existing predictions (if they now predict fewer matches)
			const leftoverIds = Object.values(existingByRound)
				.flat()
				.map((p) => p.id);
			if (leftoverIds.length > 0) {
				await supabase
					.from("knockout_predictions")
					.delete()
					.in("id", leftoverIds);
			}

			const { data, error } = await supabase
				.from("knockout_predictions")
				.upsert(payload);

			if (error) {
				console.error("Error saving predictions:", error);
				throw error;
			}

			return data;
		},
		onSuccess: () => {
			setSyncedPredictions(predictions);
			setIsSaved(true);
			queryClient.invalidateQueries({
				queryKey: ["knockoutPredictions", profileId],
			});
		},
	});

	const handlePredictionChange = (matchId: number, winnerId: string) => {
		if (isLocked) return;
		setIsSaved(false);
		setPredictions((prev) => {
			const next = { ...prev };
			next[matchId] = winnerId;

			let currentMatchId = matchId;
			let rIdx = rounds.findIndex((r) =>
				r.some((m) => m.id === currentMatchId),
			);

			while (rIdx !== -1 && rIdx < rounds.length - 1) {
				const matchIndexInRound = rounds[rIdx].findIndex(
					(m) => m.id === currentMatchId,
				);
				const nextRoundMatchIndex = Math.floor(matchIndexInRound / 2);
				const nextMatch = rounds[rIdx + 1]?.[nextRoundMatchIndex];

				if (nextMatch) {
					delete next[nextMatch.id];
					currentMatchId = nextMatch.id;
					rIdx++;
				} else {
					break;
				}
			}

			return next;
		});
	};

	const predictedChampionCode = useMemo(() => {
		const finalRound = rounds.at(-1);
		if (!finalRound || finalRound.length !== 1) return undefined;

		const winnerId = predictions[finalRound[0].id];
		if (!winnerId) return undefined;

		return allTeamsMap.get(winnerId)?.short_name;
	}, [rounds, predictions, allTeamsMap]);

	const hasUnsavedChanges = useMemo(
		() =>
			rounds.flat().some((m) => predictions[m.id] !== syncedPredictions[m.id]),
		[rounds, predictions, syncedPredictions],
	);

	if (rounds.length === 0) {
		return <Alert>No knockout matches available.</Alert>;
	}

	const currentRoundMatches = rounds[currentStep];
	const isCurrentRoundComplete = currentRoundMatches.every(
		(m) => predictions[m.id] !== undefined,
	);
	const isAllMatchesPredicted = rounds
		.flat()
		.every((m) => predictions[m.id] !== undefined);
	const isSavedToServer = isAllMatchesPredicted && !hasUnsavedChanges;

	return (
		<Box mt="xl">
			<WinnerOverlay
				open={isSaved}
				onClose={() => setIsSaved(false)}
				teamCode={predictedChampionCode}
			/>
			<Stepper
				active={currentStep}
				onStepClick={setCurrentStep}
				allowNextStepsSelect={false}
				orientation="horizontal"
				visibleFrom="sm"
			>
				{rounds.map((round, index) => (
					<Stepper.Step
						key={index}
						label={getRoundName(round.length)}
						description={`${round.length} matches`}
					/>
				))}
			</Stepper>

			<Box hiddenFrom="sm" mt="md" mb="xl" ta="center">
				<Text fw={700} size="xl">
					{getRoundName(currentRoundMatches.length)}
				</Text>
				<Text c="dimmed" size="sm">
					{currentRoundMatches.length === 1
						? "Select the tournament winner."
						: 'Select the winner for each match by clicking the team and press "Next round" at the end.'}
				</Text>
			</Box>

			<Box mt="xl">
				{currentRoundMatches.map((match, matchIndex) => {
					const teams = getTeamsForMatch(
						rounds,
						currentStep,
						matchIndex,
						match,
						predictions,
						allTeamsMap,
					);
					const homeTeam = teams.home;
					const awayTeam = teams.away;
					const selectedWinnerId = predictions[match.id];

					return (
						<Box key={match.id} mb="xl">
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
								<Paper
									withBorder
									p="sm"
									onClick={() =>
										homeTeam && handlePredictionChange(match.id, homeTeam.id)
									}
									style={{
										cursor: homeTeam && !isLocked ? "pointer" : "not-allowed",
										opacity:
											!homeTeam ||
											(selectedWinnerId && selectedWinnerId !== homeTeam?.id)
												? 0.5
												: 1,
										borderColor:
											selectedWinnerId === homeTeam?.id
												? "var(--wc-purple)"
												: undefined,
										transition: "all 0.15s ease",
									}}
								>
									<Flex align="center" gap="xs">
										<Checkbox
											checked={selectedWinnerId === homeTeam?.id}
											onChange={() =>
												homeTeam &&
												handlePredictionChange(match.id, homeTeam.id)
											}
											disabled={!homeTeam || isLocked}
											color="brand"
											onClick={(e) => e.stopPropagation()}
										/>
										<Text size="sm" fw={600} style={{ flex: 1 }}>
											{homeTeam ? homeTeam.name : "TBD"}
										</Text>
									</Flex>
								</Paper>

								<Paper
									withBorder
									p="sm"
									onClick={() =>
										awayTeam && handlePredictionChange(match.id, awayTeam.id)
									}
									style={{
										cursor: awayTeam && !isLocked ? "pointer" : "not-allowed",
										opacity:
											!awayTeam ||
											(selectedWinnerId && selectedWinnerId !== awayTeam?.id)
												? 0.5
												: 1,
										borderColor:
											selectedWinnerId === awayTeam?.id
												? "var(--wc-purple)"
												: undefined,
										transition: "all 0.15s ease",
									}}
								>
									<Flex align="center" gap="xs">
										<Checkbox
											checked={selectedWinnerId === awayTeam?.id}
											onChange={() =>
												awayTeam &&
												handlePredictionChange(match.id, awayTeam.id)
											}
											disabled={!awayTeam || isLocked}
											color="brand"
											onClick={(e) => e.stopPropagation()}
										/>
										<Text size="sm" fw={600} style={{ flex: 1 }}>
											{awayTeam ? awayTeam.name : "TBD"}
										</Text>
									</Flex>
								</Paper>
							</SimpleGrid>
						</Box>
					);
				})}
			</Box>

			<Flex justify="center" mt="xl" gap="md">
				{currentStep > 0 && (
					<Button
						variant="default"
						onClick={() => setCurrentStep((s) => s - 1)}
					>
						Back
					</Button>
				)}
				{currentStep < rounds.length - 1 ? (
					<Button
						onClick={() => {
							setCurrentStep((s) => s + 1);
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						disabled={!isCurrentRoundComplete}
					>
						Next Round
					</Button>
				) : (
					<Button
						onClick={() => savePredictions()}
						disabled={!isAllMatchesPredicted || isSavedToServer}
						loading={isPending}
						color={isSavedToServer ? "green" : "brand"}
					>
						{isSavedToServer ? "Predictions saved!" : "Save Predictions"}
					</Button>
				)}
			</Flex>
		</Box>
	);
}
