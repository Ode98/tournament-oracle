import { Title, Flex } from "@mantine/core";
import { useAuth } from "./AuthProvider";

export function Header() {
	const { user, nickname } = useAuth();

	if (!user) return null;

	return (
		<Flex justify="space-between" align="center" mb="xl">
			<Title order={2}>Gm, {nickname}!</Title>
			{/* <Menu shadow="md" width={200}>
				<Menu.Target>
					<Button
						variant="subtle"
						rightSection={<Avatar size="sm" radius="xl" color="blue" />}
					>
						{nickname || user.email}
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Item
						color="red"
						leftSection={<LogOut size={14} />}
						onClick={() => supabase.auth.signOut()}
					>
						Log out
					</Menu.Item>
				</Menu.Dropdown>
			</Menu> */}
		</Flex>
	);
}
