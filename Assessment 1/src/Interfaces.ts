//TeamSummary organization constants
//Number of priority types, used to generate correct array size (rows)
export enum Priority {
  LOW = 0,
  MEDIUM,
  HIGH,
  ALL, //Should be final value
  NUM_LEVELS = ALL, //Final index coincides with count of levels
}

//Number of metric types, used to generate correct array size (columns)
export enum Metric {
  COUNT = 0,
  TIME,
  SCORE,
  NUM_METRICS,
}

//Validation Codes for Tickets
export enum TicketStatus {
  OKAY = 0,
  ERR_PRIORITY,
  ERR_DATE,
  ERR_RATING,
  ERR_TIME,
}
export enum TicketStatusString {
  OKAY = "Ticket Okay",
  ERR_PRIORITY = "Priority Level Error",
  ERR_DATE = "Date Error",
  ERR_RATING = "Customer Rating Error",
  ERR_TIME = "Resolution Time Error",
}

//Interface matching the structure of the incoming json data
export interface Ticket {
  ticket_id: string;
  ticket_created_at: string;
  ticket_resolved_at: string;
  time_to_resolve: string;
  assigned_team: string;
  ticket_category: string;
  ticket_priority: string;
  resolution_notes: string;
  customer_satisfaction_rating: string;
}

//Interface of the TeamSummary, the return from generating reports
export interface TeamSummary {
  teamName: string;
  ticketsByCategoryMap: Map<string, number[][]>;
  totalTeamTickets: number;
  totalTeamTime: number;
  totalTeamScore: number;
}
