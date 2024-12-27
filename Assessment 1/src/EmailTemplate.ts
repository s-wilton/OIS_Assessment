//Importing named constants to improve code readability
import { Priority, Metric, TeamSummary } from "./Interfaces";
import { TeamSummaryObject } from "./TeamSummaryIngestion";

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
  //Start building the HTML, serialized as a String, stopping after the opening tbody tag
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

  //Various worker variables for the loops
  var curTeam: TeamSummary;
  var colorDiff: boolean = true,
    firstLoop: boolean = true,
    nameWritten: boolean;
  var categoryMetricTotal: number,
    categoryMetricLowP: number,
    categoryMetricMedP: number,
    categoryMetricHighP: number;

  //Loop through the teams in the summary, sorted alphabetically
  teamLoop: for (var [teamName, teamSummary] of [
    ...summaryMap.entries(),
  ].sort()) {
    colorDiff = !colorDiff; //Flip between to table colors with each team to improve report readability
    nameWritten = false; //Check if the team name has already been written
    curTeam = teamSummary.getSummary();

    //If this is not the first team to be looped through, add an additional row to visually-separate this from the preview team
    if (firstLoop) {
      firstLoop = false;
    } else {
      reportHTML += '<tr><td style="border: none"></td></tr>';
    }

    //Loop through the map representing categories that this team dealt with
    categoryLoop: for (var [categoryName, categoryTickets] of [
      ...curTeam.ticketsByCategoryMap.entries(),
    ].sort()) {
      //Create a row for the category and color it appropriately. Print the team name IFF it hasn't been printed in the previous row. Print the category.
      reportHTML += `
        <tr ${colorDiff ? "style='background-color: #F0FFFF;'" : ""}>
          <td>${!nameWritten ? curTeam.teamName : ""}</td>
          <td>${categoryName}</td>
      `;

      //Name is definitely written by this point
      nameWritten = true;

      //Push an additional layer on to the tricket matrix representing this category
      //This will hold totals per metric across priorities
      categoryTickets.push(Array(Metric.NUM_METRICS).fill(0));

      //Loop through tickets in category
      ticketLoop: for (
        var curMetric = 0;
        curMetric < categoryTickets.length;
        curMetric++
      ) {
        //Quick-use variables
        categoryMetricLowP = categoryTickets[Priority.LOW][curMetric];
        categoryMetricMedP = categoryTickets[Priority.MEDIUM][curMetric];
        categoryMetricHighP = categoryTickets[Priority.HIGH][curMetric];
        categoryMetricTotal =
          categoryMetricLowP + categoryMetricMedP + categoryMetricHighP;

        //Assign category totals to newly-added matrix dimension
        categoryTickets[Priority.ALL][curMetric] = categoryMetricTotal;

        //For each metric, in the current case, Tickets Completed, Ticket Time, and Ticket Score
        switch (curMetric) {
          //Tickets Completed
          case Metric.COUNT:
            //Append a cell with the tickets completed metric, with a percentage representing how much of the team total it is
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${categoryMetricLowP} M-${categoryMetricMedP} H-${categoryMetricHighP}">
                ${categoryMetricTotal} (~${(
              (categoryMetricTotal / curTeam.totalTeamTickets) *
              100
            ).toFixed(1)}%)
              </td>
            `;
            break;

          //Total and Average Times
          case Metric.TIME:
            //Append a cell with the total ticket time for this category, converted to hours (rounded ###.#), with a percentage representing how much of the team total it is
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            reportHTML += `
              <td class="hint--right hint--no-animate" data-hint="L-${(
                categoryMetricLowP / 360
              ).toFixed(1)}hrs M-${(categoryMetricMedP / 360).toFixed(
              1
            )}hrs H-${(categoryMetricHighP / 360).toFixed(1)}hrs">
                ${(categoryMetricTotal / 360).toFixed(1)} hrs (~${(
              (categoryMetricTotal / curTeam.totalTeamTime) *
              100
            ).toFixed(1)}%)
              </td>
            `;

            //Append a cell with the average time per for this category, converted to hours (rounded #.#)
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
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

          //Customer Satisfaction Ratings
          case Metric.SCORE:
            //Append a cell with the average customer rating
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
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
      //End the row for the category
      reportHTML += `</tr>`;
    }

    //Append row containing team totals and averages across all metrics and priorities
    reportHTML += `
      <tr style="font-weight: bold; ${
        colorDiff ? "background-color: #F0FFFF;" : ""
      }">
        <td></td>
        <td style="text-align: right">Totals:</td>
        <td>${curTeam.totalTeamTickets}</td> 
        <td>${(curTeam.totalTeamTime / 360).toFixed(1)} hrs</td>
        <td>${(curTeam.totalTeamTime / curTeam.totalTeamTickets / 360).toFixed(
          1
        )} hrs average</td>
        <td>${(curTeam.totalTeamScore / curTeam.totalTeamTickets).toFixed(
          1
        )} average</td>
      </tr>
    `;
  }

  //Close the table body and append a footer noting the number of tickets excluded for errors
  //Close table
  reportHTML += `</tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="text-align: right; border: none">
          ${ticketErrs.length} tickets excluded due to data errors
        </td>
      </tr>
    </tfoot>
  </table>`;

  //Return the HTML, serialized as a String, stripping out unnecessary whitespace and truncating spaces
  return reportHTML.trim().replace(/([\n\r\t]+|\s{2,})/gm, (match) => {
    return match.match(/([\n\r\t]+)/gm) ? "" : " ";
  });
}
