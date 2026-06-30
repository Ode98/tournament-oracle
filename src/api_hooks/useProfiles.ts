import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useProfiles() {
	const profilesQuery = supabase
		.from("profiles")
		.select("id, nickname, group_stage_points, knockout_stage_points");

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
	});
}
