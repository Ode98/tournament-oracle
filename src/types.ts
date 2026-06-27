import { type Tables } from "../database.types";

export type ITeam = Tables<"teams">;
export type IGroup = Tables<"groups">;
export type IGroupPrediction = Tables<"group_predictions">;
export type IKnockoutMatch = Tables<"knockout_matches">;
export type IKnockoutPrediction = Tables<"knockout_predictions">;
