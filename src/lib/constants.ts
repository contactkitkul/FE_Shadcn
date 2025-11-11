import { EnumLeague } from "@/types";

// Team to League mapping for auto-assignment
export const TEAM_LEAGUE_MAP: Record<string, EnumLeague> = {
  // Premier League
  "Manchester United": EnumLeague.PREMIER_LEAGUE,
  "Liverpool": EnumLeague.PREMIER_LEAGUE,
  "Chelsea": EnumLeague.PREMIER_LEAGUE,
  "Arsenal": EnumLeague.PREMIER_LEAGUE,
  "Manchester City": EnumLeague.PREMIER_LEAGUE,
  "Tottenham Hotspur": EnumLeague.PREMIER_LEAGUE,
  "Newcastle United": EnumLeague.PREMIER_LEAGUE,
  "Aston Villa": EnumLeague.PREMIER_LEAGUE,
  "West Ham United": EnumLeague.PREMIER_LEAGUE,
  "Brighton": EnumLeague.PREMIER_LEAGUE,
  "Everton": EnumLeague.PREMIER_LEAGUE,
  "Leicester City": EnumLeague.PREMIER_LEAGUE,
  "Wolverhampton": EnumLeague.PREMIER_LEAGUE,
  
  // La Liga
  "Real Madrid": EnumLeague.LA_LIGA,
  "Barcelona": EnumLeague.LA_LIGA,
  "Atletico Madrid": EnumLeague.LA_LIGA,
  "Sevilla": EnumLeague.LA_LIGA,
  "Valencia": EnumLeague.LA_LIGA,
  "Real Betis": EnumLeague.LA_LIGA,
  "Real Sociedad": EnumLeague.LA_LIGA,
  "Villarreal": EnumLeague.LA_LIGA,
  "Athletic Bilbao": EnumLeague.LA_LIGA,
  
  // Serie A
  "Juventus": EnumLeague.SERIE_A,
  "AC Milan": EnumLeague.SERIE_A,
  "Inter Milan": EnumLeague.SERIE_A,
  "Napoli": EnumLeague.SERIE_A,
  "Roma": EnumLeague.SERIE_A,
  "Lazio": EnumLeague.SERIE_A,
  "Atalanta": EnumLeague.SERIE_A,
  "Fiorentina": EnumLeague.SERIE_A,
  
  // Bundesliga
  "Bayern Munich": EnumLeague.BUNDESLIGA,
  "Borussia Dortmund": EnumLeague.BUNDESLIGA,
  "RB Leipzig": EnumLeague.BUNDESLIGA,
  "Bayer Leverkusen": EnumLeague.BUNDESLIGA,
  "Eintracht Frankfurt": EnumLeague.BUNDESLIGA,
  "Borussia Monchengladbach": EnumLeague.BUNDESLIGA,
  "Wolfsburg": EnumLeague.BUNDESLIGA,
  "Stuttgart": EnumLeague.BUNDESLIGA,
  
  // Ligue 1
  "PSG": EnumLeague.LIGUE_1,
  "Paris Saint-Germain": EnumLeague.LIGUE_1,
  "Marseille": EnumLeague.LIGUE_1,
  "Lyon": EnumLeague.LIGUE_1,
  "Monaco": EnumLeague.LIGUE_1,
  "Lille": EnumLeague.LIGUE_1,
  "Nice": EnumLeague.LIGUE_1,
  "Rennes": EnumLeague.LIGUE_1,
};

// List of all teams for dropdown
export const TEAMS = Object.keys(TEAM_LEAGUE_MAP).sort();

// Tracking provider URLs
export const TRACKING_URLS: Record<string, string> = {
  DHL: "https://www.dhl.com/track?tracking-id={trackingNumber}",
  FedEx: "https://www.fedex.com/fedextrack/?trknbr={trackingNumber}",
  UPS: "https://www.ups.com/track?tracknum={trackingNumber}",
  "Royal Mail": "https://www.royalmail.com/track-your-item#/tracking-results/{trackingNumber}",
  USPS: "https://tools.usps.com/go/TrackConfirmAction?tLabels={trackingNumber}",
};

// Helper function to get tracking URL
export const getTrackingUrl = (provider: string, trackingNumber: string): string => {
  const template = TRACKING_URLS[provider];
  if (!template) return "#";
  return template.replace("{trackingNumber}", trackingNumber);
};

// Helper function to get league from team
export const getLeagueFromTeam = (team: string): EnumLeague | undefined => {
  return TEAM_LEAGUE_MAP[team];
};
