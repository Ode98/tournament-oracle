import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useGroupPredictions(user_id: string | undefined) {
	const groupPredictionsQuery = supabase
		.from("group_predictions")
		.select("*")
		.eq("profile_id", user_id ?? "");

	return useQuery({
		queryKey: ["grpoupPredictions"],
		queryFn: async () => {
			const { data, error } = await groupPredictionsQuery;
			if (error) {
				console.error(error);
				throw error;
			}
			return data;
		},
		enabled: !!user_id,
	});
}
