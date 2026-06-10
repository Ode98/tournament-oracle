import {
	Flex,
	Loader,
	Paper,
	Title,
	Stack,
	Badge,
	Text,
	Center,
} from "@mantine/core";
import { useGroupPredictions } from "../api_hooks/useGroupPredictions";
import type { IGroupPrediction } from "../types";
import { useGroups } from "../api_hooks/useGroups";

export function UserPredictions({
	profile,
}: {
	profile: { id: string; nickname: string };
}) {
	const { data: data, isPending } = useGroupPredictions(profile.id);
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
			<Center h="100%">
				<Loader size="lg" />
			</Center>
		);
	}

	return (
		<Flex direction="column" gap="8px">
			{data?.length === 0 && !isPending && (
				<Text mt="md">No predictions found for this profile.</Text>
			)}

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

						<Flex>
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
						</Flex>
					</Paper>
				);
			})}
		</Flex>
	);
}
