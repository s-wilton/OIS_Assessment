import {
  Ticket,
  TeamSummary,
  Priority,
  PriorityString,
  Metric,
} from "./Interfaces";

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
   * @TODO Error handling on any operations issues
   */
  public updateValues(newTicket: Ticket): void {
    //If this ticket belongs to a new work category
    //Create new ticket matrix, initialize with 0s, and add it to the category map with a key matching the category
    if (!this.ticketsByCategoryMap.has(newTicket.ticket_category)) {
      this.ticketsByCategoryMap.set(
        newTicket.ticket_category,
        Array(Priority.NUM_LEVELS)
          .fill(0)
          .map(() => Array(Metric.NUM_METRICS).fill(0))
      );
    }

    //Create variables for regularly used values in the following code
    var curPriorityCode: number,
      newTicketTime: number = parseInt(newTicket.time_to_resolve),
      newTicketScore: number = parseInt(newTicket.customer_satisfaction_rating),
      //Get current category matrix for manipulating
      existingCategoryValues: number[][] = this.ticketsByCategoryMap.get(
        newTicket.ticket_category
      );

    //Retrieve index cooresponding to priority level
    curPriorityCode = Object.values(PriorityString).indexOf(
      newTicket.ticket_priority.toLowerCase() as PriorityString
    );

    //Increment the ticket count for the category and overall team totals
    existingCategoryValues[curPriorityCode][Metric.COUNT] += 1;
    this.totalTickets += 1;

    //Add the ticket resolution time for the category and overall team totals
    existingCategoryValues[curPriorityCode][Metric.TIME] += newTicketTime;
    this.totalTime += newTicketTime;

    //Add the ticket score for the category and overall team totals
    existingCategoryValues[curPriorityCode][Metric.SCORE] += newTicketScore;
    this.totalScore += newTicketScore;

    //Insert the transformed matrix back into the map by category
    this.ticketsByCategoryMap.set(
      newTicket.ticket_category,
      existingCategoryValues
    );

    //return 0;
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
