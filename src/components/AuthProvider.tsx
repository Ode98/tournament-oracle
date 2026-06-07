import { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

type AuthState = {
	session: Session | null;
	user: User | null;
	nickname: string | null;
	loading: boolean;
};

const AuthContext = createContext<AuthState>({
	session: null,
	user: null,
	nickname: null,
	loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({
		session: null,
		user: null,
		nickname: null,
		loading: true,
	});

	useEffect(() => {
		let mounted = true;
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (!mounted) return;

			setState({
				session,
				user: session?.user || null,
				nickname: session?.user?.user_metadata?.nickname,
				loading: false,
			});
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (mounted) {
				setState({
					session,
					user: session?.user || null,
					nickname: session?.user?.user_metadata?.nickname,
					loading: false,
				});
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
