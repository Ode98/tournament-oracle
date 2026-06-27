import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export interface TournamentTimeline {
	groupPredictionsDeadline: Date;
	knockoutPredictionsStart: Date | null;
	knockoutPredictionsDeadline: Date;
}

export function useTournamentSettings() {
	return useQuery({
		queryKey: ["tournamentSettings"],
		queryFn: async (): Promise<TournamentTimeline> => {
			const { data, error } = await supabase
				.from("tournament_settings")
				.select(
					"group_predictions_deadline, knockout_predictions_deadline, knockout_predictions_start",
				)
				.eq("id", 1)
				.single();

			if (error) {
				console.error("Failed to fetch tournament settings:", error);
				throw error;
			}

			return {
				groupPredictionsDeadline: new Date(data.group_predictions_deadline),
				knockoutPredictionsDeadline: new Date(
					data.knockout_predictions_deadline,
				),
				knockoutPredictionsStart: data.knockout_predictions_start
					? new Date(data.knockout_predictions_start)
					: null,
			};
		},
		staleTime: Infinity,
	});
}
