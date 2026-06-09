import { Text, Alert, Button, Flex, LoadingOverlay } from "@mantine/core";
import { DragDropProvider } from "@dnd-kit/react";
import { Lock, Clock, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { usePredictionDeadline } from "../hooks/usePredictionDeadline";
import { ThirdPlaceSelector } from "./ThirdPlaceSelector";
import { Group } from "./group/Group";
import type { IGroupPrediction, IGroup, ITeam } from "../types";
import { supabase } from "../utils/supabase";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

function areArraysEqualSimple(arr1: any[], arr2: any[]): boolean {
	if (arr1.length !== arr2.length) return false;
	const pluckAndStringify = (arr: any[]) =>
		arr
			.map(
				({ group_id, is_third_place_qualified, predicted_position, team_id }) =>
					JSON.stringify({
						group_id,
						is_third_place_qualified,
						predicted_position,
						team_id,
					}),
			)
			.sort();
	const str1 = pluckAndStringify(arr1);
	const str2 = pluckAndStringify(arr2);
	return str1.every((str, index) => str === str2[index]);
}

export type IClientGroupPrediction = Omit<
	IGroupPrediction,
	"id" | "profile_id"
>;

export function GroupPrediction({
	savedGroupPredictions,
	groupsWithTeams,
	profileId,
}: {
	savedGroupPredictions: Array<IGroupPrediction>;
	groupsWithTeams: Array<IGroup & { teams: Array<ITeam> }>;
	profileId: string;
}) {
	const queryClient = useQueryClient();
	const { mutate: savePredictions, isPending } = useMutation({
		mutationFn: async (
			predictions: Array<IGroupPrediction | IClientGroupPrediction>,
		) => {
			const { error } = await supabase.rpc("bulk_update_predicted_positions", {
				updates: predictions.map((p) => ({
					...("id" in p && p.id ? { prediction_id: p.id } : {}),
					team_id: p.team_id,
					group_id: p.group_id,
					predicted_position: p.predicted_position,
					is_third_place_qualified: p.is_third_place_qualified,
					profile_id: profileId,
				})),
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["groupPredictions", profileId],
			});
		},
	});

	const defaultPredictions = groupsWithTeams
		.map((g) => ({
			...g,
			teams: g.teams
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((t, index) => ({
					team_id: t.id,
					group_id: t.group_id,
					predicted_position: index + 1,
					is_third_place_qualified: false,
				})),
		}))
		.flatMap((g) => g.teams);

	const [groupPredictions, setGroupPredictions] = useState<
		Record<string, Array<IGroupPrediction | IClientGroupPrediction>>
	>(
		savedGroupPredictions.length > 0
			? savedGroupPredictions.reduce<Record<string, IGroupPrediction[]>>(
					(acc, item) => {
						if (!acc[item.group_id]) {
							acc[item.group_id] = [];
						}
						acc[item.group_id].push(item);
						return acc;
					},
					{},
				)
			: defaultPredictions.reduce<Record<string, IClientGroupPrediction[]>>(
					(acc, item) => {
						if (!acc[item.group_id]) {
							acc[item.group_id] = [];
						}
						acc[item.group_id].push(item);
						return acc;
					},
					{},
				),
	);

	const flatGroupPredictions = Object.values(groupPredictions).flat();
	const thirdTeamPredictions = flatGroupPredictions.filter(
		(p) => p.predicted_position === 3,
	);
	const thirdPlaceSelections = thirdTeamPredictions
		.filter((p) => p.is_third_place_qualified)
		.map((p) => p.team_id);

	const isUnsavedChanges = !areArraysEqualSimple(
		flatGroupPredictions,
		savedGroupPredictions,
	);

	function onChangeThirdPlaceQualified(teamsIds: Array<string>) {
		setGroupPredictions((prev) => {
			const allValues = Object.values(prev).flat();
			const mappedValues = allValues.map((prediction) => {
				const is_third_place_qualified = teamsIds.some(
					(id) => id === prediction.team_id,
				);
				return {
					...prediction,
					is_third_place_qualified,
				};
			});
			return mappedValues.reduce<
				Record<string, Array<IGroupPrediction | IClientGroupPrediction>>
			>((acc, item) => {
				if (!acc[item.group_id]) {
					acc[item.group_id] = [];
				}
				acc[item.group_id].push(item);
				return acc;
			}, {});
		});
	}

	const { isLocked, deadline, isLockedPending } =
		usePredictionDeadline("group");
	const [timeLeft, setTimeLeft] = useState<string>("");

	useEffect(() => {
		if (isLocked || !deadline) return;
		const updateTimer = () => {
			const total = deadline.getTime() - new Date().getTime();
			if (total <= 0) {
				setTimeLeft("Predictions closed");
				return;
			}
			const seconds = Math.floor((total / 1000) % 60);
			const minutes = Math.floor((total / 1000 / 60) % 60);
			const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
			const days = Math.floor(total / (1000 * 60 * 60 * 24));

			const parts = [];
			if (days > 0) parts.push(`${days}d`);
			if (hours > 0) parts.push(`${hours}h`);
			if (minutes > 0) parts.push(`${minutes}m`);
			if (days === 0 && hours === 0) {
				parts.push(`${seconds}s`);
			}
			setTimeLeft(parts.join(" "));
		};
		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [deadline, isLocked]);

	return (
		<>
			<LoadingOverlay
				visible={isLockedPending}
				zIndex={1000}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
			{isLocked && !isLockedPending ? (
				<Alert
					variant="light"
					color="red"
					title="Predictions Locked"
					icon={<Lock size={16} />}
					mt="md"
				>
					The deadline was {deadline?.toLocaleString()}.
				</Alert>
			) : (
				<Alert
					variant="light"
					color="blue"
					title="Predictions Open"
					icon={<Clock size={16} />}
					mt="md"
				>
					<Text fw="bold">
						Time remaining: {isLockedPending ? "Loading..." : timeLeft}
					</Text>
				</Alert>
			)}
			{(!savedGroupPredictions || savedGroupPredictions.length === 0) && (
				<Alert variant="light" color="orange" icon={<Info size={16} />} mt="md">
					You don't have any saved predictions yet. Start by long pressing a
					team to drag it in your preferred order to set your predictions for
					each group. Don't forget to save your picks at the end!
				</Alert>
			)}
			<DragDropProvider
				onDragEnd={(event) => {
					if (event.canceled) return;
					setGroupPredictions((prev) => {
						const sourceId = event.operation.source?.id;
						// @ts-ignore
						const initialIndex = event.operation.source?.initialIndex;
						// @ts-ignore
						const newIndex = event.operation.target?.index;

						if (
							initialIndex === undefined ||
							newIndex === undefined ||
							initialIndex === newIndex ||
							!sourceId
						) {
							return prev;
						}

						const groupId = Object.keys(prev).find((key) =>
							prev[key].some(
								(p) =>
									("id" in p && p.id === sourceId) || p.team_id === sourceId,
							),
						);

						if (!groupId) return prev;

						const nextGroupArray = [...prev[groupId]];
						const [movedItem] = nextGroupArray.splice(initialIndex, 1);
						nextGroupArray.splice(newIndex, 0, movedItem);

						const updatedGroupArray = nextGroupArray.map((item, index) => ({
							...item,
							predicted_position: (index + 1) as 1 | 2 | 3 | 4,
						}));

						return {
							...prev,
							[groupId]: updatedGroupArray,
						};
					});
				}}
			>
				{groupsWithTeams?.map((group) => (
					<Group
						group={group}
						isLocked={isLocked}
						isPending={isPending}
						key={group.id}
						groupPredictions={groupPredictions[group.id]}
					/>
				))}
			</DragDropProvider>
			{groupsWithTeams && groupsWithTeams.length > 0 && (
				<ThirdPlaceSelector
					groups={groupsWithTeams}
					thirdTeamPredictions={thirdTeamPredictions}
					selectedTeamIds={thirdPlaceSelections}
					onChange={onChangeThirdPlaceQualified}
					isLocked={isLocked}
				/>
			)}
			<Flex justify="center">
				<Button
					mt="xl"
					onClick={() => {
						savePredictions(Object.values(groupPredictions).flat());
					}}
					size="xl"
					disabled={thirdPlaceSelections.length < 8 || !isUnsavedChanges}
					loading={isPending}
				>
					{thirdPlaceSelections.length < 8
						? "Select the third place qualifiers"
						: isUnsavedChanges
							? "Save your picks"
							: "All changes saved!"}
				</Button>
			</Flex>
		</>
	);
}
