import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useProfiles({ userId }: { userId: string | undefined }) {
	const profilesQuery = supabase.from("profiles").select("id, nickname");

	return useQuery({
		queryKey: ["profiles"],
		queryFn: async () => {
			const { data, error } = await profilesQuery;
			if (error) {
				console.error(error);
				throw error;
			}
			return data;
		},
		enabled: !!userId,
	});
}
