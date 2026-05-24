import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { Container, Title, Text, Button } from "@mantine/core";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { supabase } from "./utils/supabase";
import { useState } from "react";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Container py="xl">
        <Outlet />
      </Container>
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexComponent() {
    const { user, nickname, loading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    if (loading) {
      return <Text ta="center">Loading...</Text>;
    }

    if (user) {
      return (
        <>
          <Title order={2} ta="center" mb="xl">
            Hello {nickname || user.email}
          </Title>
          <Button
            fullWidth
            variant="light"
            onClick={() => supabase.auth.signOut()}
          >
            Log out
          </Button>
        </>
      );
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
  },
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
