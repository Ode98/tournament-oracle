import { Title, Flex, ActionIcon } from "@mantine/core";
import { useAuth } from "./AuthProvider";
import { useRouter, useMatches, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function Header() {
	const { user, nickname } = useAuth();
	const router = useRouter();
	const matches = useMatches();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	if (!user) return null;

	const isDashboard = pathname === "/dashboard";
	const currentMatch = [...matches]
		.reverse()
		.find((match) => match.staticData?.title);
	const title =
		(currentMatch?.staticData?.title as string) ?? `Greetings, ${nickname}!`;

	return (
		<Flex align="center" gap="xs" mb="xl">
			{!isDashboard && (
				<ActionIcon
					size="lg"
					variant="transparent"
					onClick={() => router.history.back()}
				>
					<ChevronLeft size={30} />
				</ActionIcon>
			)}
			<Title order={2}>{title}</Title>
		</Flex>
	);
}
