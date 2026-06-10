import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export type TournamentStatus =
	| "groupPredictions"
	| "groupPlaying"
	| "knockoutPredictions"
	| "knockoutPlaying"
	| "pending"
	| "error";

interface TournamentTimeline {
	groupPredictionsDeadline: Date;
	knockoutPredictionsStart: Date | null;
	knockoutPredictionsDeadline: Date;
}

function formatTimeLeft(ms: number): string {
	if (ms <= 0) return "0m";
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));

	const parts = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

	return parts.join(" ");
}

export function useTournamentStatus() {
	const [timeline, setTimeline] = useState<TournamentTimeline | null>(null);
	const [fetchError, setFetchError] = useState<boolean>(false);
	const [now, setNow] = useState<Date>(new Date());

	useEffect(() => {
		const fetchSettings = async () => {
			const { data, error } = await supabase
				.from("tournament_settings")
				.select(
					"group_predictions_deadline, knockout_predictions_deadline, knockout_predictions_start",
				)
				.eq("id", 1)
				.single();

			if (error || !data) {
				console.error("Failed to fetch tournament settings:", error);
				setFetchError(true);
				return;
			}

			setTimeline({
				groupPredictionsDeadline: new Date(data.group_predictions_deadline),
				knockoutPredictionsDeadline: new Date(
					data.knockout_predictions_deadline,
				),
				knockoutPredictionsStart: data.knockout_predictions_start
					? new Date(data.knockout_predictions_start)
					: null,
			});
		};

		fetchSettings();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, 60000);

		return () => clearInterval(interval);
	}, []);

	if (fetchError) {
		return { status: "error" as const, nextStatus: null, timeLeft: null };
	}

	if (!timeline) {
		return { status: "pending" as const, nextStatus: null, timeLeft: null };
	}

	const {
		groupPredictionsDeadline,
		knockoutPredictionsStart,
		knockoutPredictionsDeadline,
	} = timeline;

	let status: TournamentStatus = "pending";
	let nextStatus: TournamentStatus | null = null;
	let targetDate: Date | null = null;

	if (now < groupPredictionsDeadline) {
		status = "groupPredictions";
		nextStatus = "groupPlaying";
		targetDate = groupPredictionsDeadline;
	} else if (!knockoutPredictionsStart || now < knockoutPredictionsStart) {
		status = "groupPlaying";
		nextStatus = knockoutPredictionsStart
			? "knockoutPredictions"
			: "knockoutPlaying";
		targetDate = knockoutPredictionsStart || knockoutPredictionsDeadline;
	} else if (now < knockoutPredictionsDeadline) {
		status = "knockoutPredictions";
		nextStatus = "knockoutPlaying";
		targetDate = knockoutPredictionsDeadline;
	} else {
		status = "knockoutPlaying";
		nextStatus = null; // No upcoming status left
	}

	const timeLeftMs = targetDate ? targetDate.getTime() - now.getTime() : 0;
	const timeLeft = targetDate ? formatTimeLeft(timeLeftMs) : null;

	return { status, nextStatus, timeLeft };
}
