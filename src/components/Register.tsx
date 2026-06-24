import { Title, Text, Button } from "@mantine/core";
import { RegisterForm } from "./RegisterForm";
import { useAuth } from "./AuthProvider";
import { Link, Navigate } from "@tanstack/react-router";

export function Register() {
	const { user, loading } = useAuth();

	if (loading) {
		return <Text ta="center">Loading...</Text>;
	}

	if (user) {
		return <Navigate to="/dashboard" />;
	}

	return (
		<>
			<Title order={2} ta="center" mb="xl">
				Register
			</Title>
			<RegisterForm />
			<Text ta="center" mt="md">
				Already have a code?{" "}
				<Button variant="subtle" component={Link} to="/login">
					Login
				</Button>
			</Text>
		</>
	);
}
