import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type QueryData } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

const knockoutMatchesQuery = supabase
	.from("knockout_matches")
	.select(
		`
	    *,
        home_team:teams!knockout_matches_home_team_id_fkey(*),
        away_team:teams!knockout_matches_away_team_id_fkey(*),
        actual_winner:teams!knockout_matches_actual_winner_id_fkey(*)
        `,
	)
	.order("order_number", { ascending: true });

type KnockoutMatches = QueryData<typeof knockoutMatchesQuery>;

interface UseGroupsOptions extends Omit<
	UseQueryOptions<KnockoutMatches, Error>,
	"queryKey" | "queryFn"
> {}

export function useKnockoutMatches(options?: UseGroupsOptions) {
	return useQuery({
		queryKey: ["knockoutMatches"],
		queryFn: async (): Promise<KnockoutMatches> => {
			const { data, error } = await knockoutMatchesQuery;

			if (error) {
				console.error(error);
				throw error;
			}

			return data;
		},
		...options,
	});
}
