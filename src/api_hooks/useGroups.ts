import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type QueryData } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

const groupsQuery = supabase
	.from("groups")
	.select("*, teams (*)")
	.order("name", { ascending: true });

type GroupsWithTeams = QueryData<typeof groupsQuery>;

interface UseGroupsOptions extends Omit<
	UseQueryOptions<GroupsWithTeams, Error>,
	"queryKey" | "queryFn"
> {}

export function useGroups(options?: UseGroupsOptions) {
	return useQuery({
		queryKey: ["groups"],
		queryFn: async (): Promise<GroupsWithTeams> => {
			const { data, error } = await groupsQuery;

			if (error) {
				console.error(error);
				throw error;
			}

			return data;
		},
		...options,
	});
}
