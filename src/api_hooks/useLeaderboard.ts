import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

type ILeaderBoard = {
	profile_id: string;
	nickname: string;
	score: number;
};

const leaderboardQuery = supabase.functions.invoke("leaderboard", {
	method: "GET",
});

export function useLeaderboard() {
	return useQuery({
		queryKey: ["leaderboard"],
		queryFn: async (): Promise<Array<ILeaderBoard>> => {
			const { data, error } = await leaderboardQuery;

			if (error) {
				console.error(error);
				throw error;
			}

			return data.data;
		},
	});
}
