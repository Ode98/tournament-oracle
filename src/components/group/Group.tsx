import { Title, Stack, Paper, Flex, Badge, Center, Text } from "@mantine/core";
import { LockIcon } from "lucide-react";
import { useRef } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import type { IGroup, IGroupPrediction, ITeam } from "../../types";
import { GripHorizontal } from "lucide-react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import { type IClientGroupPrediction } from "../GroupPrediction";

export function Group({
	group,
	isLocked,
	isPending,
	groupPredictions,
}: {
	group: IGroup & { teams: Array<ITeam> };
	isLocked: boolean;
	isPending: boolean;
	groupPredictions: Array<IGroupPrediction | IClientGroupPrediction>;
}) {
	const containerRef = useRef(null);

	return (
		<Paper withBorder bdrs="md" p="sm" mt="lg">
			<Title
				className="lohko-title"
				style={{ userSelect: "none" }}
				order={2}
				mb="md"
			>
				{isLocked && <LockIcon size={20} style={{ marginRight: "0.25rem" }} />}{" "}
				Group {group.name}
			</Title>

			<Flex>
				<Stack bdrs="md" align="stretch" justify="center" gap="sm">
					{group.teams.map((_, index) => (
						<Paper
							key={index}
							h="60px"
							withBorder
							style={{ borderRightWidth: 0 }}
							bdrs="10 0 0 10"
							pl="sm"
							pr="xs"
						>
							<Center h="100%">
								<Badge
									size="lg"
									variant="filled"
									color={index <= 1 ? "green" : index === 2 ? "yellow" : "red"}
								>
									{index + 1}.
								</Badge>
							</Center>
						</Paper>
					))}
				</Stack>
				<Stack
					flex={1}
					bdrs="md"
					align="stretch"
					justify="center"
					gap="sm"
					ref={containerRef}
					style={{ pointerEvents: isPending || isLocked ? "none" : "all" }}
				>
					{groupPredictions
						?.sort((a, b) => a.predicted_position - b.predicted_position)
						.map((gp, index) => {
							const team = group.teams.find((t) => t.id === gp.team_id);
							if (!team) return null;
							return (
								<SortableCountry
									team={team}
									key={team.name}
									name={team.name}
									index={index}
									groupName={group.name}
									container={containerRef}
									isLocked={isLocked}
								/>
							);
						})}
				</Stack>
			</Flex>
		</Paper>
	);
}

function SortableCountry({
	team,
	name,
	index,
	groupName,
	container,
	isLocked,
}: {
	team: ITeam;
	name: string | null;
	index: number;
	groupName: string;
	container: React.RefObject<HTMLDivElement | null>;
	isLocked: boolean;
}) {
	const { ref } = useSortable({
		id: team.id,
		index,
		modifiers: [
			RestrictToVerticalAxis,
			RestrictToElement.configure({
				element: container.current,
			}),
		],
		type: groupName,
		accept: groupName,
		group: groupName,
	});

	return (
		<Paper
			ref={ref}
			className="item"
			withBorder
			bdrs="0 10 10 0"
			h="60px"
			pl="xs"
			pr="sm"
			style={{ cursor: "grab" }}
		>
			<Flex h="100%" align="center" justify="space-between">
				<Flex gap="xs" align="center">
					<Text style={{ userSelect: "none" }} fw="bold">
						{name}
					</Text>
				</Flex>

				{isLocked ? (
					<Flex justify="center" align="center">
						<LockIcon />
					</Flex>
				) : (
					<Flex justify="center" align="center">
						<GripHorizontal className="grip-handle" />
					</Flex>
				)}
			</Flex>
		</Paper>
	);
}
