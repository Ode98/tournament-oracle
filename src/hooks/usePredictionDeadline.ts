import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export function usePredictionDeadline(phase: "group" | "knockout") {
	const [isLocked, setIsLocked] = useState<boolean>(true);
	const [deadline, setDeadline] = useState<Date | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			const { data, error } = await supabase
				.from("tournament_settings")
				.select("group_predictions_deadline, knockout_predictions_deadline")
				.eq("id", 1)
				.single();

			if (error || !data) return;

			const targetDeadline =
				phase === "group"
					? new Date(data.group_predictions_deadline)
					: new Date(data.knockout_predictions_deadline);

			setDeadline(targetDeadline);
			setIsLocked(new Date() > targetDeadline);
		};

		fetchSettings();
	}, [phase]);

	return { isLocked, deadline };
}
