import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export function usePredictionDeadline(phase: "group" | "knockout") {
	const [isLocked, setIsLocked] = useState<boolean>(true);
	const [deadline, setDeadline] = useState<Date | null>(null);
	const [isPending, setIsPending] = useState<boolean>(true);

	useEffect(() => {
		const fetchSettings = async () => {
			setIsPending(true);
			const { data, error } = await supabase
				.from("tournament_settings")
				.select("group_predictions_deadline, knockout_predictions_deadline")
				.eq("id", 1)
				.single();

			if (error || !data) {
				setIsPending(false);
				return;
			}

			const targetDeadline =
				phase === "group"
					? new Date(data.group_predictions_deadline)
					: new Date(data.knockout_predictions_deadline);

			setDeadline(targetDeadline);
			setIsLocked(new Date() > targetDeadline);
			setIsPending(false);
		};

		fetchSettings();
	}, [phase]);

	return { isLocked, deadline, isLockedPending: isPending };
}
