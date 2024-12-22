//Basic File for holding constants and error codes

//TeamSummary organization constants
//Number of priority types, used to generate correct array size (rows)
export const NUMBER_OF_PRIORITY_TYPES: number = 3;
//Constants for Priority, first-level of ticket category array
export const LOW_PRIORITY: number = 0;
export const MEDIUM_PRIORITY: number = 1;
export const HIGH_PRIORITY: number = 2;
//Extra index for holding summed values across all priorities for the metric
export const ALL_PRIORITY: number = 3;

//Number of metric types, used to generate correct array size (columns)
export const NUMBER_OF_TICKET_METRICS: number = 3;
//Constants for ticket metric type, second-level of ticket category array
export const COUNT: number = 0;
export const TIME: number = 1;
export const SCORE: number = 2;

//Object for packaging summary organization contants
//Deprecated due to code cluttering
// export const SummaryIndexes = {
//   LOW_PRIORITY,
//   MEDIUM_PRIORITY,
//   HIGH_PRIORITY,
//   ALL_PRIORITY,
//   COUNT,
//   TIME,
//   SCORE,
// };

//Validation Codes for Tickets
export const TICKET_OKAY: number = 0;
export const TICKET_ERR_PRIORITY: number = 1;
export const TICKET_ERR_DATE: number = 2;
export const TICKET_ERR_RATING: number = 3;
export const TICKET_ERR_TIME: number = 4;

//Object for packaging ticket validation contants
//Deprecated due to code cluttering
// export const ValidationCodes = {
//   TICKET_OKAY,
//   TICKET_ERR_PRIORITY,
//   TICKET_ERR_DATE,
//   TICKET_ERR_RATING,
//   TICKET_ERR_TIME,
// };
