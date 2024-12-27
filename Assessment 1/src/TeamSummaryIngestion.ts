//Importing named constants to improve code readability and easily reference indexes
import { TicketStatus, TicketStatusString, Ticket } from "./Interfaces";
import { validateTicket } from "./ValidateTicket";
import { TeamSummaryObject } from "./TeamSummaryObject";

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
  var summaryMap: Map<string, TeamSummaryObject> = new Map();
  var ticketErrs: [number, number, string][] = [];
  var ticket: Ticket;
  var ticketTeam: string;
  var ticketValidationCode: number;

  //Iterate through the provided json ticket data
  for (var i in data) {
    ticket = data[i];
    ticketTeam = ticket.assigned_team;

    //Validate before passing
    if ((ticketValidationCode = validateTicket(ticket)) != TicketStatus.OKAY) {
      ticketErrs.push([
        parseInt(ticket.ticket_id),
        ticketValidationCode,
        `Err ${ticketValidationCode} - ${TicketStatusString[ticketValidationCode]}`,
      ]);
      continue;
    }

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
