import {
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
	Outlet,
	Navigate,
} from "@tanstack/react-router";
import { Container, Text } from "@mantine/core";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Predictions } from "./components/Predictions";

const rootRoute = createRootRoute({
	component: () => (
		<AuthProvider>
			<Container py="xl">
				<Header />
				<Outlet />
			</Container>
		</AuthProvider>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: function IndexComponent() {
		const { user, loading } = useAuth();

		if (loading) {
			return <Text ta="center">Loading...</Text>;
		}

		if (user) {
			return <Navigate to="/dashboard" />;
		}

		return <Navigate to="/login" />;
	},
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: Login,
});

const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/dashboard",
	component: Dashboard,
});

const predictionsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/predictions",
	staticData: {
		title: "My predictions",
	},
	component: Predictions,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	dashboardRoute,
	predictionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default function App() {
	return <RouterProvider router={router} />;
}
