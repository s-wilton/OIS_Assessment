//Importing named constants to improve code readability and easily reference indexes
import {
  NUMBER_OF_PRIORITY_TYPES,
  LOW_PRIORITY,
  MEDIUM_PRIORITY,
  HIGH_PRIORITY,
  NUMBER_OF_TICKET_METRICS,
  COUNT,
  TIME,
  SCORE,
} from "./Constants";

//Importing named constants to improve code readability and easily reference error codes
import {
  TICKET_OKAY,
  TICKET_ERR_PRIORITY,
  TICKET_ERR_DATE,
  TICKET_ERR_RATING,
  TICKET_ERR_TIME,
} from "./Constants";

//Global object for storing ticket errors
//Array of tuples in the form: [Ticket ID, Ticket Error Code, Error Text]
var ticketErrs: [number, number, string][] = [];

//Interface matching the structure of the incoming json data
interface Ticket {
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

/**
 * The Team Summary Object, holding the name of the team and performance metrics.
 * This class holds the team name, a map containing all ticket data by category, and summed totals for number of tickets completed, total time taken, and total ratings.
 */
export class TeamSummaryObject {
  readonly teamName: string;
  private totalTickets: number = 0;
  private totalTime: number = 0;
  private totalScore: number = 0;

  ticketsByCategoryMap: Map<string, number[][]> = new Map();

  /**
   * Creates an instance of the TeamSummaryObject.
   * @param {string} name - The name of the team.
   * @param {Ticket} newTicket - The new ticket that contains data to update the team.
   */
  constructor(name: string, newTicket: Ticket) {
    this.teamName = name;
    this.updateValues(newTicket);
  }

  /**
   * Updates the team's summary values based on the new ticket data.
   * This method processes the new ticket and adjusts the score, total tickets, and total time by in the category map and overall team totals.
   * @param {Ticket} newTicket - The new ticket that contains data to update the team.
   * @returns {number} Returns 0 on success, 1 on an invalid ticket.
   */
  public updateValues(newTicket: Ticket): number {
    //Return immediately if ticket is not valid
    if (validateTicket(newTicket) != TICKET_OKAY) return 1;

    //If this ticket belongs to a new work category
    //Create new ticket matrix, initialize with 0s, and add it to the category map with a key matching the category
    if (!this.ticketsByCategoryMap.has(newTicket.ticket_category)) {
      this.ticketsByCategoryMap.set(
        newTicket.ticket_category,
        Array(NUMBER_OF_PRIORITY_TYPES)
          .fill(0)
          .map(() => Array(NUMBER_OF_TICKET_METRICS).fill(0))
      );
    }

    //Create variables for regularly used values in the following code
    var priorityCode: number,
      newTicketTime: number = parseInt(newTicket.time_to_resolve),
      newTicketScore: number = parseInt(newTicket.customer_satisfaction_rating),
      //Get current category values for manipulating
      existingCategoryValues: number[][] = this.ticketsByCategoryMap.get(
        newTicket.ticket_category
      );

    //Convert the ticket_priority to a named constant
    //Ticket is validated to have one of these three values at this point
    switch (newTicket.ticket_priority.toLowerCase()) {
      case "low":
        priorityCode = LOW_PRIORITY;
        break;
      case "medium":
        priorityCode = MEDIUM_PRIORITY;
        break;
      case "high":
        priorityCode = HIGH_PRIORITY;
        break;
    }

    //Increment the ticket count for the category and overall team totals
    existingCategoryValues[priorityCode][COUNT] += 1;
    this.totalTickets += 1;

    //Add the ticket resolution time for the category and overall team totals
    existingCategoryValues[priorityCode][TIME] += newTicketTime;
    this.totalTime += newTicketTime;

    //Add the ticket score for the category and overall team totals
    existingCategoryValues[priorityCode][SCORE] += newTicketScore;
    this.totalScore += newTicketScore;

    //Insert the transformed values back into the map by category
    this.ticketsByCategoryMap.set(
      newTicket.ticket_category,
      existingCategoryValues
    );

    return 0;
  }

  /**
   * Retrieves the summary of the team's performance and returns it as a TeamSummary object
   * @returns {TeamSummary} The summary object representing the team's performance.
   */
  public getSummary(): TeamSummary {
    return {
      teamName: this.teamName,
      ticketsByCategoryMap: this.ticketsByCategoryMap,
      totalTeamTickets: this.totalTickets,
      totalTeamTime: this.totalTime,
      totalTeamScore: this.totalScore,
    };
  }
}

/**
 * Validates the provided ticket and returns a status code.
 * This function checks if the ticket meets certain criteria and returns a corresponding validation result.
 * @param {Ticket} checkTicket - The ticket object to be validated.
 * @returns {number} A status code representing the ticket's validity, or an error code representing the reason for being invalid.
 */
function validateTicket(checkTicket: Ticket): number {
  var retCode: number = TICKET_OKAY,
    ticketId: number = parseInt(checkTicket.ticket_id);

  //Checks that the priority "low," "medium," or "high"
  if (!/^(low|medium|high)$/.test(checkTicket.ticket_priority.toLowerCase())) {
    retCode = TICKET_ERR_PRIORITY;
    ticketErrs.push([
      ticketId,
      retCode,
      `Err ${retCode} - Priority Level Error`,
    ]);
    return retCode;
  }

  //Checks that the creation date is not in the future and does not appear after resolution date
  //Uncertain if resolution dates can be "planned ahead" in this system
  /**@TODO Determine if system allows for resolution dates to be ahead in time and adjust code */
  var ticketResolutionDate: Date = new Date(checkTicket.ticket_resolved_at),
    ticketCreationDate: Date = new Date(
      new Date(checkTicket.ticket_created_at)
    );
  if (
    ticketCreationDate > new Date() ||
    ticketCreationDate > ticketResolutionDate
  ) {
    retCode = TICKET_ERR_DATE;
    ticketErrs.push([ticketId, retCode, `Err ${retCode} - Date Error`]);
    return retCode;
  }

  //Check that the customer satisfaction rating is a number in the 1..5 range
  var customerRating: number = parseInt(
    checkTicket.customer_satisfaction_rating
  );
  if (1 > customerRating || customerRating > 5) {
    retCode = TICKET_ERR_RATING;
    ticketErrs.push([
      ticketId,
      retCode,
      `Err ${retCode} - Customer Score Error`,
    ]);
    return retCode;
  }

  //Check that the time to resolve is not negative
  var ticketTime: number = parseInt(checkTicket.time_to_resolve);
  if (ticketTime <= 0) {
    retCode = TICKET_ERR_TIME;
    ticketErrs.push([
      ticketId,
      retCode,
      `Err ${retCode} - Resolution Time Error`,
    ]);
    return retCode;
  }

  //Reaching this means the ticket is likely valid
  return retCode;
}
/**
 * Generates team summaries based on the json ticket data.
 * This function processes the input json ticket data and returns a summary of team performance summaries and ticket errors.
 * @param {object} data - The input json ticket data used to generate the team summaries.
 * @returns {object} An object containing:
 * - teamSummaryMap: A Map<string, TeamSummaryObject> where each entry represents a team, with the team name as the key and the corresponding TeamSummaryObject as the value.
 * - ticketErrsArr: An array of tuples (`[number, number, string]`), each representing an error
 *     related to a ticket, containing:
 *     - The ticket number
 *     - The ticket error code
 *     - A string describing the error message
 */
export function generateTeamSummaries(data: object): {
  teamSummaryMap: Map<string, TeamSummaryObject>;
  ticketErrsArr: [number, number, string][];
} {
  let summaryMap: Map<string, TeamSummaryObject> = new Map();
  let ticket: Ticket;
  let ticketTeam: string;

  //Iterate through the provided json ticket data
  for (var i in data) {
    ticket = data[i];
    ticketTeam = ticket.assigned_team;

    //If the team already exists in the summary map, update their summary
    //otherwise, create a new team summary and insert it into the map.
    if (summaryMap.has(ticketTeam)) {
      summaryMap.get(ticketTeam).updateValues(ticket);
    } else {
      summaryMap.set(ticketTeam, new TeamSummaryObject(ticketTeam, ticket));
    }
  }

  return { teamSummaryMap: summaryMap, ticketErrsArr: ticketErrs };
}
