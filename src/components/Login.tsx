import { Title, Text, Button } from "@mantine/core";
import { useState } from "react";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";
import { useAuth } from "./AuthProvider";
import { Navigate } from "@tanstack/react-router";

export function Login() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return <Text ta="center">Loading...</Text>;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      {showLogin ? (
        <>
          <Title order={2} ta="center" mb="xl">
            Login
          </Title>
          <LoginForm />
          <Text ta="center" mt="md">
            Don't have a code?{" "}
            <Button variant="subtle" onClick={() => setShowLogin(false)}>
              Register
            </Button>
          </Text>
        </>
      ) : (
        <>
          <Title order={2} ta="center" mb="xl">
            Register
          </Title>
          <RegisterForm />
          <Text ta="center" mt="md">
            Already have a code?{" "}
            <Button variant="subtle" onClick={() => setShowLogin(true)}>
              Login
            </Button>
          </Text>
        </>
      )}
    </>
  );
}
