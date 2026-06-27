import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useKnockoutPredictions(user_id: string | undefined) {
	const knockoutPredictionsQuery = supabase
		.from("knockout_predictions")
		.select("*")
		.eq("profile_id", user_id ?? "");

	return useQuery({
		queryKey: ["knockoutPredictions", user_id],
		queryFn: async () => {
			const { data, error } = await knockoutPredictionsQuery;

			if (error) {
				console.error(error);
				throw error;
			}

			return data;
		},
		enabled: !!user_id,
		staleTime: 0,
	});
}
