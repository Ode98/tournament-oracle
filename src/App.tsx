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
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Predictions } from "./components/predictions/GroupPredictions";
import { KnockoutPredictions } from "./components/predictions/KnockoutPredictions";

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
	validateSearch: (search: Record<string, unknown>) => {
		const result: { code?: string } = {};
		if (typeof search.code === "string") {
			result.code = search.code;
		}
		return result;
	},
	component: Login,
});

const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: Register,
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

const knockoutPredictionsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/knockout-predictions",
	staticData: {
		title: "My predictions",
	},
	component: KnockoutPredictions,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	dashboardRoute,
	predictionsRoute,
	knockoutPredictionsRoute,
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
