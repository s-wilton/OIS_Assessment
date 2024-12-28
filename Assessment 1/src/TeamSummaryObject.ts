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
  private totalTeamTickets: number = 0;
  private totalTeamTimeSeconds: number = 0;
  private totalTeamScore: number = 0;

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
    //Initialize a new ticket matrix with zeros, keyed to the category string
    if (!this.ticketsByCategoryMap.has(newTicket.ticket_category)) {
      this.ticketsByCategoryMap.set(
        newTicket.ticket_category,
        Array(Priority.NUM_LEVELS)
          .fill(0)
          .map(() => Array(Metric.NUM_METRICS).fill(0))
      );
    }

    //Converts the string representing the priority to a numerical representation for indexing matrices
    const newTicketPriorityCode: number = Object.values(PriorityString).indexOf(
      newTicket.ticket_priority.toLowerCase() as PriorityString
    );

    //Grab the existing ticket matrix, keyed under this category, to manipulate before reinserting later
    var existingCategoryValues: number[][] = this.ticketsByCategoryMap.get(
      newTicket.ticket_category
    );

    existingCategoryValues[newTicketPriorityCode][Metric.COUNT] += 1;
    this.totalTeamTickets += 1;

    const newTicketTime: number = parseInt(newTicket.time_to_resolve);
    existingCategoryValues[newTicketPriorityCode][Metric.TIME_SECONDS] +=
      newTicketTime;
    this.totalTeamTimeSeconds += newTicketTime;

    const newTicketScore: number = parseInt(
      newTicket.customer_satisfaction_rating
    );
    existingCategoryValues[newTicketPriorityCode][Metric.SCORE] +=
      newTicketScore;
    this.totalTeamScore += newTicketScore;

    //Reinsert the transformed ticket matrix
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
      totalTeamTickets: this.totalTeamTickets,
      totalTeamTimeSeconds: this.totalTeamTimeSeconds,
      totalTeamScore: this.totalTeamScore, //Total score, average it later
    };
  }
}
