export type TeamCelebration = {
	name: string;
	flagPath: string;
	anecdote: string;
};

const flagUrlByFilename = Object.fromEntries(
	Object.entries(
		import.meta.glob<string>("../assets/Flag_of_*.gif", {
			eager: true,
			query: "?url",
			import: "default",
		}),
	).map(([path, url]) => [path.split("/").pop()!, url]),
);

const flagPath = (countryName: string) =>
	`src/assets/Flag_of_${countryName.replace(/ /g, "_")}.gif`;

export const TEAM_CELEBRATIONS: Record<string, TeamCelebration> = {
	GER: {
		name: "Germany",
		flagPath: flagPath("Germany"),
		anecdote: "Efficiency meets football. Zee machine is running!",
	},
	CUR: {
		name: "Curaçao",
		flagPath: "src/assets/Flag_of_Curacao.gif",
		anecdote: "Tiny island, giant dreams!",
	},
	CIV: {
		name: "Côte d'Ivoire",
		flagPath: "src/assets/Flag_of_Ivory_Coast.gif",
		anecdote: "The Elephants never forget… a trophy!",
	},
	QAT: {
		name: "Qatar",
		flagPath: flagPath("Qatar"),
		anecdote: "Hosting was practice. This is the main event!",
	},
	SUI: {
		name: "Switzerland",
		flagPath: flagPath("Switzerland"),
		anecdote: "Neutral on politics, ruthless on the pitch!",
	},
	CAN: {
		name: "Canada",
		flagPath: flagPath("Canada"),
		anecdote: "Co-hosting at home — finally our turn, eh!",
	},
	POR: {
		name: "Portugal",
		flagPath: flagPath("Portugal"),
		anecdote: "CR7's ghost still haunts every defender!",
	},
	UZB: {
		name: "Uzbekistan",
		flagPath: "src/assets/Flag_of_Uzbekistan_(official).gif",
		anecdote: "Silk Road to the final!",
	},
	COD: {
		name: "Congo DR",
		flagPath: "src/assets/Flag_of_the_Democratic_Republic_of_the_Congo.gif",
		anecdote: "The Leopards are on the prowl!",
	},
	COL: {
		name: "Colombia",
		flagPath: flagPath("Colombia"),
		anecdote: "¡Vamos! The coffee's brewing something special!",
	},
	NOR: {
		name: "Norway",
		flagPath: flagPath("Norway"),
		anecdote: "Viking spirit, Haaland-approved!",
	},
	FRA: {
		name: "France",
		flagPath: flagPath("France"),
		anecdote: "Baguettes, berets, and back-to-back glory!",
	},
	IRQ: {
		name: "Iraq",
		flagPath: flagPath("Iraq"),
		anecdote: "The Lions of Mesopotamia roar!",
	},
	NED: {
		name: "Netherlands",
		flagPath: "src/assets/Flag_of_the_Netherlands.gif",
		anecdote: "Total football. Total belief!",
	},
	JPN: {
		name: "Japan",
		flagPath: flagPath("Japan"),
		anecdote: "Samurai precision, anime-level plot twists!",
	},
	TUN: {
		name: "Tunisia",
		flagPath: flagPath("Tunisia"),
		anecdote: "The Eagles of Carthage soar again!",
	},
	URU: {
		name: "Uruguay",
		flagPath: flagPath("Uruguay"),
		anecdote: "Smallest country, biggest heart!",
	},
	CPV: {
		name: "Cabo Verde",
		flagPath: "src/assets/Flag_of_Cape_Verde.gif",
		anecdote: "Island vibes, continental ambitions!",
	},
	ESP: {
		name: "Spain",
		flagPath: flagPath("Spain"),
		anecdote: "Tiki-taka never went out of style!",
	},
	KSA: {
		name: "Saudi Arabia",
		flagPath: flagPath("Saudi_Arabia"),
		anecdote: "Human rights? nah, World cup? Hell YEA!",
	},
	MAR: {
		name: "Morocco",
		flagPath: flagPath("Morocco"),
		anecdote: "The Atlas Lions climb every mountain!",
	},
	HAI: {
		name: "Haiti",
		flagPath: flagPath("Haiti"),
		anecdote: "Underdogs with Caribbean soul!",
	},
	SCO: {
		name: "Scotland",
		flagPath: flagPath("Scotland"),
		anecdote: "Freedom! And maybe football too!",
	},
	BRA: {
		name: "Brazil",
		flagPath: flagPath("Brazil"),
		anecdote: "Jogo bonito. Sixth star loading…",
	},
	TUR: {
		name: "Türkiye",
		flagPath: "src/assets/Flag_of_Turkey.gif",
		anecdote: "Watch out Europe, the Crescent rises!",
	},
	AUS: {
		name: "Australia",
		flagPath: flagPath("Australia"),
		anecdote: "Down Under, on top!",
	},
	USA: {
		name: "USA",
		flagPath: "src/assets/Flag_of_the_United_States.gif",
		anecdote: "Soccer? No, FOOTBALL! (American edition)",
	},
	MEX: {
		name: "Mexico",
		flagPath: flagPath("Mexico"),
		anecdote: "¡Olé! Another World Cup, another party!",
	},
	RSA: {
		name: "South Africa",
		flagPath: flagPath("South_Africa"),
		anecdote: "Bafana Bafana — the nation unites!",
	},
	CZE: {
		name: "Czech Republic",
		flagPath: "src/assets/Flag_of_the_Czech_Republic.gif",
		anecdote: "Bohemian rhapsody in football form!",
	},
	GHA: {
		name: "Ghana",
		flagPath: flagPath("Ghana"),
		anecdote: "The Black Stars shine brightest!",
	},
	PAN: {
		name: "Panama",
		flagPath: flagPath("Panama"),
		anecdote: "Canal country, championship dreams!",
	},
	ENG: {
		name: "England",
		flagPath: flagPath("England"),
		anecdote: "It's coming home!",
	},
	JOR: {
		name: "Jordan",
		flagPath: flagPath("Jordan"),
		anecdote: "The Nomads ride to glory!",
	},
	ALG: {
		name: "Algeria",
		flagPath: flagPath("Algeria"),
		anecdote: "Les Fennecs desert the competition!",
	},
	ARG: {
		name: "Argentina",
		flagPath: flagPath("Argentina"),
		anecdote: "ANKARA MESI ANKARA MESI GOL GOL GOL GOL GOL!",
	},
	AUT: {
		name: "Austria",
		flagPath: flagPath("Austria"),
		anecdote: "Sound of music, sight of goals!",
	},
	EGY: {
		name: "Egypt",
		flagPath: flagPath("Egypt"),
		anecdote: "Pharaohs rise from the dust!",
	},
	BEL: {
		name: "Belgium",
		flagPath: flagPath("Belgium"),
		anecdote: "Small country, golden generation!",
	},
	NZL: {
		name: "New Zealand",
		flagPath: flagPath("New_Zealand"),
		anecdote: "All Whites, all heights!",
	},
	ECU: {
		name: "Ecuador",
		flagPath: flagPath("Ecuador"),
		anecdote: "La Tri — from the equator to the top!",
	},
	BIH: {
		name: "Bosnia and Herzegovina",
		flagPath: flagPath("Bosnia_and_Herzegovina"),
		anecdote: "I'm from Bosnia, take me to America!",
	},
	SEN: {
		name: "Senegal",
		flagPath: flagPath("Senegal"),
		anecdote: "The Lions of Teranga hunt trophies!",
	},
	SWE: {
		name: "Sweden",
		flagPath: flagPath("Sweden"),
		anecdote: "IKEA instructions: assemble a winning team!",
	},
	PAR: {
		name: "Paraguay",
		flagPath: flagPath("Paraguay"),
		anecdote: "La Albirroja marches on!",
	},
	KOR: {
		name: "South Korea",
		flagPath: flagPath("South_Korea"),
		anecdote: "Squid Game? No, World Cup game!",
	},
	CRO: {
		name: "Croatia",
		flagPath: flagPath("Croatia"),
		anecdote: "Small nation, big hearts, checkered flags!",
	},
	IRN: {
		name: "IR Iran",
		flagPath: "src/assets/Flag_of_Iran.gif",
		anecdote: "Team Melli marches to glory!",
	},
};

export function getTeamCelebration(
	teamCode: string,
): TeamCelebration | undefined {
	return TEAM_CELEBRATIONS[teamCode];
}

export function getTeamFlagUrl(teamCode: string): string | undefined {
	const celebration = TEAM_CELEBRATIONS[teamCode];
	if (!celebration) return undefined;
	const filename = celebration.flagPath.split("/").pop()!;
	return flagUrlByFilename[filename];
}
