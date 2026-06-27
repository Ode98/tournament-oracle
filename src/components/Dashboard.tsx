import {
	LoadingOverlay,
	Button,
	Title,
	Paper,
	Flex,
	Stack,
	Text,
	Badge,
	Drawer,
} from "@mantine/core";
import { useAuth } from "./AuthProvider";
import { Navigate, Link } from "@tanstack/react-router";
import { useLeaderboard } from "../api_hooks/useLeaderboard";
import { Star } from "lucide-react";
import { useState } from "react";
import { UserPredictions } from "./UserPredictions";
import { useMediaQuery } from "@mantine/hooks";
import { useTournamentStatus } from "../hooks/useTournamentStatus";

function PointsBadge({ points }: { points: number }) {
	return (
		<Badge variant="gradient" miw="70px">
			<Flex w="100%" align="center" gap="2px" justify="center">
				<Text size="sm">{points} </Text>
				<Star
					size={16}
					style={{
						marginLeft: "0.25rem",
						marginBottom: "2px",
						minWidth: "18px",
					}}
				/>
			</Flex>
		</Badge>
	);
}

export function Dashboard() {
	const { user, loading } = useAuth();
	const { data: leaderboard, isPending: profilesLoading } = useLeaderboard();

	const [openedProfile, setOpenedProfile] = useState<null | {
		id: string;
		nickname: string;
	}>();

	const isDesktop = useMediaQuery("(min-width: 768px)");
	const { status } = useTournamentStatus();

	if (loading || profilesLoading) {
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

	return (
		<>
			{(status === "groupPredictions" || status === "groupPlaying") && (
				<Button w="100%" component={Link} to="/predictions" size="md" my="md">
					{status === "groupPredictions"
						? "Edit my group predictions"
						: "View my group predictions"}
				</Button>
			)}
			{(status === "knockoutPredictions" || status === "knockoutPlaying") && (
				<Button
					w="100%"
					component={Link}
					to="/knockout-predictions"
					size="md"
					my="md"
				>
					{status === "knockoutPredictions"
						? "Edit my knockout predictions"
						: "View my knockout predictions"}
				</Button>
			)}
			<Paper withBorder bdrs="md" p="sm" mt="sm">
				<Title
					className="lohko-title"
					style={{ userSelect: "none" }}
					order={2}
					mb="md"
				>
					Leaderboard
				</Title>
				{(status === "groupPredictions" || status === "groupPlaying") && (
					<Text mb="16px" size="sm">
						NOTE: These points are speculative and based on the CURRENT group
						standings, points will be locked only after group stage is over.
					</Text>
				)}
				<Flex>
					<Stack bdrs="md" align="stretch" justify="center" gap="sm" w="100%">
						{leaderboard
							?.sort((a, b) => (b.score || 0) - (a.score || 0))
							?.map((item, index) => {
								return (
									<Paper
										style={{ cursor: "pointer" }}
										onClick={() =>
											setOpenedProfile({
												id: item.profile_id,
												nickname: item.nickname,
											})
										}
										key={item.profile_id}
										h="40px"
										withBorder
										bdrs="10"
										px="10px"
										w="100%"
									>
										<Flex align="center" gap="xs" h="100%" w="100%">
											<Flex
												align="center"
												justify="space-between"
												gap="xs"
												h="100%"
												w="100%"
											>
												<Flex align="center" gap="xs" h="100%" w="100%">
													{index + 1}.<Text size="lg"> {item.nickname}</Text>
												</Flex>
												<PointsBadge points={item.score} />
											</Flex>
										</Flex>
									</Paper>
								);
							})}
					</Stack>
				</Flex>
			</Paper>
			<Paper withBorder bdrs="md" p="sm" mt="lg">
				<Title
					mb="sm"
					className="lohko-title"
					style={{ userSelect: "none" }}
					order={2}
				>
					Point system
				</Title>
				<Text mb="4px" fw="bold">
					Group stage
				</Text>
				<Flex mb="4px" align="center">
					<PointsBadge points={5} />{" "}
					<Text ml="8px">for each correct team standing</Text>
				</Flex>
				<Flex align="center">
					<PointsBadge points={5} />{" "}
					<Text ml="8px">for each correct qualified team</Text>
				</Flex>
				<Text mb="4px" mt="sm" fw="bold">
					Knockout stage
				</Text>
				<Flex mb="4px" align="center">
					<PointsBadge points={10} />{" "}
					<Text ml="8px">for each correct winner</Text>
				</Flex>
				<Flex align="center">
					<PointsBadge points={25} />{" "}
					<Text ml="8px">for the correct final champion</Text>
				</Flex>
			</Paper>
			<Drawer
				size={isDesktop ? "md" : "xl"}
				position={isDesktop ? "left" : "bottom"}
				styles={{ body: { height: "100%" } }}
				opened={!!openedProfile}
				onClose={() => setOpenedProfile(null)}
				title={
					openedProfile ? `${openedProfile.nickname}'s Predictions` : undefined
				}
			>
				{openedProfile && <UserPredictions profile={openedProfile} />}
			</Drawer>
		</>
	);
}
