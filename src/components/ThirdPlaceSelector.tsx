import {
	Paper,
	Title,
	Text,
	Checkbox,
	Flex,
	Badge,
	SimpleGrid,
	Alert,
} from "@mantine/core";
import { Info, Trophy } from "lucide-react";
import type { IGroup, IGroupPrediction, ITeam } from "../types";
import { type IClientGroupPrediction } from "./GroupPrediction";

const MAX_SELECTIONS = 8;

interface ThirdPlaceSelectorProps {
	groups: Array<IGroup & { teams: Array<ITeam> }>;
	selectedTeamIds: string[];
	thirdTeamPredictions: Array<IGroupPrediction | IClientGroupPrediction>;
	onChange: (selected: string[]) => void;
	isLocked: boolean;
}

export function ThirdPlaceSelector({
	groups,
	selectedTeamIds,
	thirdTeamPredictions,
	onChange,
	isLocked,
}: ThirdPlaceSelectorProps) {
	const allTeams = groups.flatMap((g) => g.teams);
	const thirdTeams = allTeams.filter((team) =>
		thirdTeamPredictions.some((p) => team.id === p.team_id),
	);
	const toggle = (team_id: string) => {
		if (isLocked) return;
		if (selectedTeamIds.includes(team_id)) {
			onChange(selectedTeamIds.filter((t) => t !== team_id));
		} else if (selectedTeamIds.length < MAX_SELECTIONS) {
			console.log("[...selectedTeamIds, team_id]:", [
				...selectedTeamIds,
				team_id,
			]);
			onChange([...selectedTeamIds, team_id]);
		}
	};

	const remaining = MAX_SELECTIONS - selectedTeamIds.length;

	return (
		<Paper withBorder bdrs="md" p="md" mt="lg">
			<Flex align="center" gap="sm" mb="xs">
				<Trophy size={20} style={{ color: "var(--wc-purple)" }} />
				<Title order={3}>Third-place Qualifiers</Title>
				<Badge
					variant="filled"
					color={remaining === 0 ? "green" : "brand"}
					ml="auto"
				>
					{selectedTeamIds.length} / {MAX_SELECTIONS}
				</Badge>
			</Flex>
			{selectedTeamIds.length < 8 && (
				<Alert
					variant="light"
					color="blue"
					icon={<Info size={14} />}
					mb="md"
					p="sm"
				>
					<Text size="sm">
						{isLocked
							? "The third-place qualifier selection is locked."
							: remaining === 0
								? "You've selected all 8 teams. You can deselect a team to change your pick."
								: `Select ${remaining} more team${remaining !== 1 ? "s" : ""} — 8 of the 12 third-placed groups advance to the Round of 32.`}
					</Text>
				</Alert>
			)}
			<SimpleGrid mt="md" cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="sm">
				{thirdTeams.map((team) => {
					const isSelected = selectedTeamIds.includes(team.id);
					const isDisabled = isLocked || (!isSelected && remaining === 0);
					const groupName = groups.find((g) => g.id === team.group_id)?.name;

					return (
						<Paper
							key={team.name}
							withBorder
							p="sm"
							onClick={() => toggle(team.id)}
							style={{
								cursor: isDisabled ? "not-allowed" : "pointer",
								opacity: isDisabled && !isSelected ? 0.45 : 1,
								borderColor: isSelected ? "var(--wc-purple)" : undefined,
								transition: "all 0.15s ease",
							}}
						>
							<Flex align="center" gap="xs">
								<Checkbox
									checked={isSelected}
									onChange={() => toggle(team.id)}
									disabled={isDisabled}
									color="brand"
									onClick={(e) => e.stopPropagation()}
								/>
								<Text size="sm" fw={600} style={{ flex: 1 }}>
									{team.name}
								</Text>
								<Badge size="xs" variant="outline" color="gray">
									Group {groupName}
								</Badge>
							</Flex>
						</Paper>
					);
				})}
			</SimpleGrid>
		</Paper>
	);
}
