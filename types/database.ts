export interface Practice {
  ID: number
  Date: string
  AttendanceSet: boolean
  Canceled: boolean
}

export interface Player {
  ID: number
  Name: string
  Position: string
  BildURL: string
  isActive: boolean
  Fuß: string
  Geburtsdatum: string
  KM_Res_Beides: string
}

export interface Attendance {
  PracticeID: number
  PlayerID: number
  Present: boolean
}

export interface TopAttender {
  id: number
  name: string
  image: string
  count: number
}

export type EventType = 
  | { type: 'GOAL'; assistPlayerID?: number }
  | { type: 'YELLOW' }
  | { type: 'YELLOW_RED' }
  | { type: 'RED' }
  | { type: 'SUBSTITUTION_IN' }
  | { type: 'SUBSTITUTION_OUT' }

export interface MatchEvent {
  ID: number
  MatchID: number
  PlayerID: number
  Minute: number
  EventDetails: EventType
}

export interface MatchLineup {
  MatchID: number
  PlayerID: number
  IsStarter: boolean
}

export type GameType = 'LEAGUE' | 'CUP' | 'FRIENDLY'

export interface Match {
  ID: number
  Date: string
  HomeTeam: string
  AwayTeam: string
  HomeScore?: number
  AwayScore?: number
  IsU23: boolean
  Season: string
  Played: boolean
  Type: GameType
  CupCompetition?: string
  Venue: string
  Events?: MatchEvent[]
  Lineup?: MatchLineup[]
}

export interface Opponent {
  ID: number
  Name: string
  HasU23: boolean
  Logo?: string
}

export interface Season {
  id: number
  name: string  // e.g. "2021/22"
} 

export interface MatchDetail {
  matchid: number
  opponent_name: string
  logourl: string
  result: string | null
  ishomegame: boolean
  season_name: string
  km_res: string | null
  date: string
  matchday: number | null
  matchtype: string
  lineupadded: boolean
}