import { Ticket, TicketStatus, PriorityString } from "./Interfaces";

/**
 * Validates the provided ticket and returns a status code.
 * This function checks if the ticket meets certain criteria and returns a corresponding validation result.
 * @param {Ticket} checkTicket - The ticket object to be validated.
 * @returns {number} A status code representing the ticket's validity, or an error code representing the reason for being invalid.
 */
export function validateTicket(checkTicket: Ticket): number {
  var retCode: number = TicketStatus.OKAY,
    ticketValid: boolean = true;

  //Checks that the priority "low," "medium," or "high"
  if (
    ticketValid &&
    !Object.values(PriorityString).includes(
      checkTicket.ticket_priority.toLowerCase() as PriorityString
    )
  ) {
    retCode = TicketStatus.ERR_PRIORITY;
    ticketValid = false;
  }

  //Checks that the creation date is not in the future and does not appear after resolution date
  //Uncertain if resolution dates can be "planned ahead" in this system
  /**@TODO Determine if system allows for resolution dates to be ahead in time and adjust code */
  var ticketResolutionDate: Date = new Date(checkTicket.ticket_resolved_at),
    ticketCreationDate: Date = new Date(
      new Date(checkTicket.ticket_created_at)
    );
  if (
    ticketValid &&
    (ticketCreationDate > new Date() ||
      ticketCreationDate > ticketResolutionDate)
  ) {
    retCode = TicketStatus.ERR_DATE;
    ticketValid = false;
  }

  //Check that the customer satisfaction rating is a number in the 1..5 range
  var customerRating: number = parseInt(
    checkTicket.customer_satisfaction_rating
  );
  if (ticketValid && (1 > customerRating || customerRating > 5)) {
    retCode = TicketStatus.ERR_RATING;
    ticketValid = false;
  }

  //Check that the time to resolve is not negative
  var ticketTime: number = parseInt(checkTicket.time_to_resolve);
  if (ticketValid && ticketTime <= 0) {
    retCode = TicketStatus.ERR_TIME;
    ticketValid = false;
  }

  return retCode;
}
