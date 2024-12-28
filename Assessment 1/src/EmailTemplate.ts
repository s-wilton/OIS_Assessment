import { Priority, Metric, TeamSummary } from "./Interfaces";
import { TeamSummaryObject } from "./TeamSummaryObject";

/**
 * Generates an HTML report based on the provided team summaries and ticket errors.
 * This function processes the given summaryMap and ticketErrs to generate a structured HTML table.
 * @param {Map<string, TeamSummaryObject>} summaryMap - A Map where each entry represents a team, with the team name as the key and the corresponding TeamSummaryObject as the value.
 * @param {[number, number, string][]} ticketErrs - An array of tuples (`[number, number, string]`), each representing an error related to a ticket, containing:
 *     - The ticket number
 *     - The ticket error code
 *     - A string describing the error message
 * @returns {string} An HTML table serialized as a string, representing the team summaries.
 */
export function generateHTMLReport(
  summaryMap: Map<string, TeamSummaryObject>,
  ticketErrs: [number, number, string][]
): string {
  var reportHTML = `
    <table>
      <style>
        table,
        td,
        th {
          border: 1px solid black;
        }
        table {
          border-collapse: collapse;
        }
        td,
        th {
          text-align: left;
          padding: 0.2rem 0.5rem;
        }
        [class*="hint--"] {
          display: table-cell !important;
        }
      </style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/hint.css/3.0.0/hint.min.css"
      />
      <caption>Ticket Summary By-Team</caption>
      <thead>
        <tr>
          <th scope="col">Team</th>
          <th scope="col">Category</th>
          <th scope="col">Total Tickets</th>
          <th scope="col">Total Time</th>
          <th scope="col">Average Time per Ticket</th>
          <th scope="col">Average Cust. Rating</th>
        </tr>
      </thead>
      <tbody>`;

  //Loop Variables
  var curTeamSummary: TeamSummary;
  var colorDiff: boolean = true,
    firstLoop: boolean = true,
    nameWritten: boolean;
  var categoryMetricTotal: number,
    categoryMetricLowP: number,
    categoryMetricMedP: number,
    categoryMetricHighP: number;

  teamLoop: for (var [teamName, teamSummary] of [
    ...summaryMap.entries(),
  ].sort()) {
    colorDiff = !colorDiff;
    nameWritten = false;
    curTeamSummary = teamSummary.getSummary();

    //Adds an additional row to visually separate summaries after the first team summary
    if (firstLoop) {
      firstLoop = false;
    } else {
      reportHTML += '<tr><td style="border: none"></td></tr>';
    }

    categoryLoop: for (var [categoryName, categoryTickets] of [
      ...curTeamSummary.ticketsByCategoryMap.entries(),
    ].sort()) {
      reportHTML += `
        <tr ${colorDiff ? "style='background-color: #F0FFFF;'" : ""}>
          <td>${!nameWritten ? curTeamSummary.teamName : ""}</td>
          <td>${categoryName}</td>
      `;

      nameWritten = true;

      //Push an additional layer on to the ticket matrix that represents this category
      //This will hold totals by-metric across priorities (e.g. total time spent in this category)
      categoryTickets.push(Array(Metric.NUM_METRICS).fill(0));

      ticketLoop: for (
        var curMetric = 0;
        curMetric < categoryTickets.length;
        curMetric++
      ) {
        categoryMetricLowP = categoryTickets[Priority.LOW][curMetric];
        categoryMetricMedP = categoryTickets[Priority.MEDIUM][curMetric];
        categoryMetricHighP = categoryTickets[Priority.HIGH][curMetric];
        categoryMetricTotal =
          categoryMetricLowP + categoryMetricMedP + categoryMetricHighP;

        categoryTickets[Priority.ALL][curMetric] = categoryMetricTotal;

        //NOTE: data-hint is for use with hint.css to improve data granularity beyond at-a-glance (hovering shows more info)
        switch (curMetric) {
          //One cell - Total tickets for this category
          case Metric.COUNT:
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${categoryMetricLowP} M-${categoryMetricMedP} H-${categoryMetricHighP}">
                ${categoryMetricTotal} (~${(
              (categoryMetricTotal / curTeamSummary.totalTeamTickets) *
              100
            ).toFixed(1)}%)
              </td>
            `;
            break;

          //Two cells - Total time in this category, and average time per ticket in this category
          case Metric.TIME_SECONDS:
            //Total Time
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${(
                categoryMetricLowP / 360
              ).toFixed(1)}hrs M-${(categoryMetricMedP / 360).toFixed(
              1
            )}hrs H-${(categoryMetricHighP / 360).toFixed(1)}hrs">
                ${(categoryMetricTotal / 360).toFixed(1)} hrs (~${(
              (categoryMetricTotal / curTeamSummary.totalTeamTimeSeconds) *
              100
            ).toFixed(1)}%)
              </td>
            `;

            //Average Time
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${(
                categoryMetricLowP /
                categoryTickets[Priority.LOW][Metric.COUNT] /
                360
              ).toFixed(1)}hrs M-${(
              categoryMetricMedP /
              categoryTickets[Priority.MEDIUM][Metric.COUNT] /
              360
            ).toFixed(1)}hrs H-${(
              categoryMetricHighP /
              categoryTickets[Priority.HIGH][Metric.COUNT] /
              360
            ).toFixed(1)}hrs">
                ${(
                  categoryMetricTotal /
                  categoryTickets[Priority.ALL][Metric.COUNT] /
                  360
                ).toFixed(1)} hrs average
              </td>
            `;
            break;

          //One cell - Average customer rating in this category
          case Metric.SCORE:
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${(
                categoryMetricLowP / categoryTickets[Priority.LOW][Metric.COUNT]
              ).toFixed(1)} M-${(
              categoryMetricMedP /
              categoryTickets[Priority.MEDIUM][Metric.COUNT]
            ).toFixed(1)} H-${(
              categoryMetricHighP / categoryTickets[Priority.HIGH][Metric.COUNT]
            ).toFixed(1)}">
                ${(
                  categoryMetricTotal /
                  categoryTickets[Priority.ALL][Metric.COUNT]
                ).toFixed(1)} average
              </td>
            `;
            break;
        }
      }
      reportHTML += `</tr>`;
    }

    //Append row containing team totals and averages across all metrics and priorities
    reportHTML += `
      <tr style="font-weight: bold; ${
        colorDiff ? "background-color: #F0FFFF;" : ""
      }">
        <td></td>
        <td style="text-align: right">Totals:</td>
        <td>${curTeamSummary.totalTeamTickets}</td> 
        <td>${(curTeamSummary.totalTeamTimeSeconds / 360).toFixed(1)} hrs</td>
        <td>${(
          curTeamSummary.totalTeamTimeSeconds /
          curTeamSummary.totalTeamTickets /
          360
        ).toFixed(1)} hrs average</td>
        <td>${(
          curTeamSummary.totalTeamScore / curTeamSummary.totalTeamTickets
        ).toFixed(1)} average</td>
      </tr>
    `;
  }

  //Append footer with ticket error count
  reportHTML += `</tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="text-align: right; border: none">
          ${ticketErrs.length} tickets excluded due to data errors
        </td>
      </tr>
    </tfoot>
  </table>`;

  //Return the String-HTML, stripping out unnecessary whitespace and truncating spaces
  return reportHTML.trim().replace(/([\n\r\t]+|\s{2,})/gm, (match) => {
    return match.match(/([\n\r\t]+)/gm) ? "" : " ";
  });
}
