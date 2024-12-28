//TeamSummary organization constants
//Number of priority types, used to generate correct array size (rows)
export enum Priority {
  LOW = 0,
  MEDIUM,
  HIGH,
  ALL, //Should be second-to-last enum value, used for holding summations by-category during report generation
  NUM_LEVELS = ALL, //Number of priority levels coincides with the index value of ALL, used in matrix generation
}
export enum PriorityString {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

//Number of metric types, used to generate correct array size (columns)
export enum Metric {
  COUNT = 0,
  TIME_SECONDS,
  SCORE,
  NUM_METRICS, //Number of metrics to consider is equal to the final enum index, used in matrix generation
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
  totalTeamTimeSeconds: number;
  totalTeamScore: number;
}
