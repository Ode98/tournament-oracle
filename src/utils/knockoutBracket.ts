import type { IKnockoutMatch, IKnockoutPrediction, ITeam } from "../types";

export const getRoundName = (size: number) => {
	if (size === 16) return "Round of 32";
	if (size === 8) return "Round of 16";
	if (size === 4) return "Quarter-finals";
	if (size === 2) return "Semi-finals";
	if (size === 1) return "Final";
	return `Round of ${size * 2}`;
};

export const buildRounds = (matches: IKnockoutMatch[]) => {
	const sortedMatches = [...matches].sort(
		(a, b) => (a.order_number ?? a.id) - (b.order_number ?? b.id),
	);
	const rounds: IKnockoutMatch[][] = [];

	if (sortedMatches.length === 0) return rounds;

	rounds.push(sortedMatches);

	let currentRoundMatches = sortedMatches;
	let nextMatchId = Math.max(...sortedMatches.map((m) => m.id)) + 1;

	while (currentRoundMatches.length > 1) {
		const nextRoundSize = Math.floor(currentRoundMatches.length / 2);
		const nextRound: IKnockoutMatch[] = [];

		for (let i = 0; i < nextRoundSize; i++) {
			nextRound.push({
				id: nextMatchId++,
				home_team_id: null,
				away_team_id: null,
				actual_winner_id: null,
			} as unknown as IKnockoutMatch);
		}

		rounds.push(nextRound);
		currentRoundMatches = nextRound;
	}

	return rounds;
};

export function buildPredictionsFromSaved(
	rounds: IKnockoutMatch[][],
	savedKnockoutPredictions: IKnockoutPrediction[],
): Record<number, string> {
	const initial: Record<number, string> = {};

	rounds.forEach((roundMatches, roundIndex) => {
		const roundValue = String(roundMatches.length * 2);
		const savedForRound = savedKnockoutPredictions.filter(
			(p) => p.round === roundValue,
		);

		roundMatches.forEach((match, matchIndex) => {
			let homeTeamId: string | undefined;
			let awayTeamId: string | undefined;

			if (roundIndex === 0) {
				homeTeamId = (match as any).home_team?.id;
				awayTeamId = (match as any).away_team?.id;
			} else {
				const prevMatch1 = rounds[roundIndex - 1][matchIndex * 2];
				const prevMatch2 = rounds[roundIndex - 1][matchIndex * 2 + 1];
				homeTeamId = prevMatch1 ? initial[prevMatch1.id] : undefined;
				awayTeamId = prevMatch2 ? initial[prevMatch2.id] : undefined;
			}

			if (
				homeTeamId &&
				savedForRound.some((p) => p.predicted_winner_id === homeTeamId)
			) {
				initial[match.id] = homeTeamId;
			} else if (
				awayTeamId &&
				savedForRound.some((p) => p.predicted_winner_id === awayTeamId)
			) {
				initial[match.id] = awayTeamId;
			}
		});
	});

	return initial;
}

export function buildTeamsMap(
	knockoutMatches: IKnockoutMatch[],
): Map<string, ITeam> {
	const map = new Map<string, ITeam>();
	knockoutMatches.forEach((m: any) => {
		if (m.home_team) map.set(m.home_team.id, m.home_team);
		if (m.away_team) map.set(m.away_team.id, m.away_team);
	});
	return map;
}

export function getTeamsForMatch(
	rounds: IKnockoutMatch[][],
	roundIndex: number,
	matchIndexInRound: number,
	match: IKnockoutMatch,
	predictions: Record<number, string>,
	allTeamsMap: Map<string, ITeam>,
) {
	if (roundIndex === 0) {
		return {
			home: (match as any).home_team as ITeam | undefined,
			away: (match as any).away_team as ITeam | undefined,
		};
	}

	const prevRound = rounds[roundIndex - 1];
	const prevMatch1 = prevRound[matchIndexInRound * 2];
	const prevMatch2 = prevRound[matchIndexInRound * 2 + 1];
	const homeTeamId = prevMatch1 ? predictions[prevMatch1.id] : undefined;
	const awayTeamId = prevMatch2 ? predictions[prevMatch2.id] : undefined;

	return {
		home: homeTeamId ? allTeamsMap.get(homeTeamId) : undefined,
		away: awayTeamId ? allTeamsMap.get(awayTeamId) : undefined,
	};
}
