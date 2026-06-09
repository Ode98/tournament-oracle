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
	Alert,
} from "@mantine/core";
import { useAuth } from "./AuthProvider";
import { Navigate, Link } from "@tanstack/react-router";
import { useProfiles } from "../api_hooks/useProfiles";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { UserPredictions } from "./UserPredictions";
import { useMediaQuery } from "@mantine/hooks";
import { usePredictionDeadline } from "../hooks/usePredictionDeadline";
import { Clock } from "lucide-react";

function PointsBadge({ points }: { points: number }) {
	return (
		<Badge variant="gradient" miw="50px">
			<Flex w="100%" align="center" gap="2px" justify="center">
				<Text size="sm">{points} </Text>
				<Star
					size={16}
					style={{ marginLeft: "0.25rem", marginBottom: "2px" }}
				/>
			</Flex>
		</Badge>
	);
}

export function Dashboard() {
	const { user, loading } = useAuth();
	const { data: profiles, isLoading: profilesLoading } = useProfiles({
		userId: user?.id,
	});
	const [openedProfile, setOpenedProfile] = useState<null | {
		id: string;
		nickname: string;
	}>();

	const isDesktop = useMediaQuery("(min-width: 768px)");

	const { isLocked, deadline } = usePredictionDeadline("group");
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
			<Alert
				variant="light"
				color="blue"
				title="Group stage predictions open"
				icon={<Clock size={16} />}
			>
				<Text fw="bold">Time remaining: {timeLeft}</Text>
			</Alert>
			<Button w="100%" component={Link} to="/predictions" size="md" my="md">
				Edit my Predictions
			</Button>
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
			<Paper withBorder bdrs="md" p="sm" mt="lg">
				<Title
					className="lohko-title"
					style={{ userSelect: "none" }}
					order={2}
					mb="md"
				>
					Leaderboard
				</Title>
				<Flex>
					<Stack bdrs="md" align="stretch" justify="center" gap="sm" w="100%">
						{profiles?.map((profile, index) => (
							<Paper
								style={{ cursor: "pointer" }}
								onClick={() => setOpenedProfile(profile)}
								key={profile.id}
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
											{index + 1}.<Text size="lg"> {profile.nickname}</Text>
										</Flex>

										<PointsBadge points={0} />
									</Flex>
								</Flex>
							</Paper>
						))}
					</Stack>
				</Flex>
			</Paper>
			<Drawer
				size={isDesktop ? "md" : "xl"}
				position={isDesktop ? "left" : "bottom"}
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
