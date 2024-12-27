/**
 *  This file differs from the other template as it is designed to make use
 *  of DOM manipulation in a NodeJS environment. Whereas the other template
 *  uses a string to build the table, which is supporeted in both a browser
 *  and NodeJS environment.
 */
import { JSDOM } from "jsdom";
const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>");
const { document } = window;

//Importing named constants to improve code readability
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
  const reportTable = document.createElement("table");

  const tableStyle = document.createElement("style");
  tableStyle.innerHTML = `table,td,th {border: 1px solid black;}table {border-collapse: collapse;} td,th {text-align: left; padding: 0.2rem 0.5rem;} [class*="hint--"] {display: table-cell !important;}`;
  reportTable.appendChild(tableStyle);

  const hintCSS = document.createElement("link");
  hintCSS.setAttribute("rel", "stylesheet");
  hintCSS.setAttribute("type", "text/css");
  hintCSS.setAttribute(
    "href",
    "https://cdnjs.cloudflare.com/ajax/libs/hint.css/3.0.0/hint.min.css"
  );
  reportTable.appendChild(hintCSS);

  const tableCaption = document.createElement("caption");
  tableCaption.innerHTML = "Ticket Summary By-Team";
  reportTable.appendChild(tableCaption);

  const tableHead = document.createElement("thead");
  const tableHeadRow = document.createElement("tr");
  const tableHeaders = [
    "Team",
    "Category",
    "Total Tickets",
    "Total Time",
    "Average Time per Ticket",
    "Average Cust. Rating",
  ];
  tableHeaders.forEach((label) => {
    const tableHeadRowCell = document.createElement("th");
    tableHeadRowCell.innerHTML = label;
    tableHeadRow.appendChild(tableHeadRowCell);
  });
  tableHead.appendChild(tableHeadRow);
  reportTable.appendChild(tableHead);

  const tableBody = document.createElement("tbody");

  const tableSpacerRow = document.createElement("tr");
  const tableSpacerEl = document.createElement("td");
  tableSpacerEl.style.border = "none";
  tableSpacerRow.appendChild(tableSpacerEl);

  //Various worker variables for the loops
  var curTeam: TeamSummary;
  var colorDiff: boolean = true,
    firstLoop: boolean = true,
    nameWritten: boolean;
  var categoryMetricTotal: number,
    categoryMetricLowP: number,
    categoryMetricMedP: number,
    categoryMetricHighP: number;

  var reportHTML = "";

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
      tableBody.appendChild(tableSpacerRow.cloneNode(true));
    }

    //Loop through the map representing categories that this team dealt with
    categoryLoop: for (var [categoryName, categoryTickets] of [
      ...curTeam.ticketsByCategoryMap.entries(),
    ].sort()) {
      //Create a row for the category and color it appropriately. Print the team name IFF it hasn't been printed in the previous row. Print the category.

      const categoryRow = document.createElement("tr");
      categoryRow.style.backgroundColor = colorDiff ? "#F0FFFF" : "#FFF";
      const teamNameCell = document.createElement("td");
      teamNameCell.innerHTML = !nameWritten ? curTeam.teamName : "";
      categoryRow.appendChild(teamNameCell);
      const categoryNameCell = document.createElement("td");
      categoryNameCell.innerHTML = categoryName;
      categoryRow.appendChild(categoryNameCell);

      //Name is definitely written by this point
      nameWritten = true;

      //Push an additional layer on to the tricket matrix representing this category
      //This will hold totals per metric across priorities
      categoryTickets.push(Array(Metric.NUM_METRICS).fill(0));

      //Loop through tickets in category
      ticketLoop: for (
        var curMetric = 0;
        curMetric < Metric.NUM_METRICS;
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

        const metricCell = document.createElement("td");
        metricCell.classList.add("hint--right", "hint--no-animate");
        //For each metric, in the current case, Tickets Completed, Ticket Time, and Ticket Score
        switch (curMetric) {
          //Tickets Completed
          case Metric.COUNT:
            //Append a cell with the tickets completed metric, with a percentage representing how much of the team total it is
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            metricCell.setAttribute(
              "data-hint",
              `L-${categoryMetricLowP} M-${categoryMetricMedP} H-${categoryMetricHighP}`
            );
            metricCell.innerHTML = `${categoryMetricTotal} (~${(
              (categoryMetricTotal / curTeam.totalTeamTickets) *
              100
            ).toFixed(1)}%)`;
            break;

          //Total and Average Times
          case Metric.TIME:
            //Append a cell with the total ticket time for this category, converted to hours (rounded ###.#), with a percentage representing how much of the team total it is
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            metricCell.setAttribute(
              "data-hint",
              `L-${(categoryMetricLowP / 360).toFixed(1)}hrs M-${(
                categoryMetricMedP / 360
              ).toFixed(1)}hrs H-${(categoryMetricHighP / 360).toFixed(1)}hrs`
            );
            metricCell.innerHTML = `${(categoryMetricTotal / 360).toFixed(
              1
            )} hrs (~${(
              (categoryMetricTotal / curTeam.totalTeamTime) *
              100
            ).toFixed(1)}%)
              `;

            categoryRow.appendChild(metricCell.cloneNode(true));

            //Append a cell with the average time per for this category, converted to hours (rounded #.#)
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            metricCell.setAttribute(
              "data-hint",
              `L-${(
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
              ).toFixed(1)}hrs`
            );
            metricCell.innerHTML = `
                ${(
                  categoryMetricTotal /
                  categoryTickets[Priority.ALL][Metric.COUNT] /
                  360
                ).toFixed(1)} hrs average
              `;
            break;

          //Customer Satisfaction Ratings
          case Metric.SCORE:
            //Append a cell with the average customer rating
            //Also add a data-hint attribute with the number of Low, Medium, and High priorities values for the this metric
            //(data-hint is for use with hint.css to improve data granularity beyond at-a-glance)
            metricCell.setAttribute(
              "data-hint",
              `L-${(
                categoryMetricLowP / categoryTickets[Priority.LOW][Metric.COUNT]
              ).toFixed(1)} M-${(
                categoryMetricMedP /
                categoryTickets[Priority.MEDIUM][Metric.COUNT]
              ).toFixed(1)} H-${(
                categoryMetricHighP /
                categoryTickets[Priority.HIGH][Metric.COUNT]
              ).toFixed(1)}`
            );
            metricCell.innerHTML = `
                ${(
                  categoryMetricTotal /
                  categoryTickets[Priority.ALL][Metric.COUNT]
                ).toFixed(1)} average
              `;
            break;
        }
        categoryRow.appendChild(metricCell);
      }
      tableBody.appendChild(categoryRow);
    }

    //TOTALS
    const totalsRow = document.createElement("tr");
    totalsRow.style.fontWeight = "bold";
    totalsRow.style.backgroundColor = colorDiff ? "#F0FFFF" : "#FFF";
    const contents = [
      "",
      "Totals:",
      curTeam.totalTeamTickets,
      `${(curTeam.totalTeamTime / 360).toFixed(1)} hrs`,
      `${(curTeam.totalTeamTime / curTeam.totalTeamTickets / 360).toFixed(
        1
      )} hrs average`,
      `${(curTeam.totalTeamScore / curTeam.totalTeamTickets).toFixed(
        1
      )} average rating`,
    ];
    contents.forEach((totalElContents) => {
      const totalsRowCell = document.createElement("td");
      if (totalElContents == "Totals:") totalsRowCell.style.textAlign = "right";
      totalsRowCell.innerHTML = totalElContents;
      totalsRow.appendChild(totalsRowCell);
    });
    tableBody.appendChild(totalsRow);
  }

  reportTable.appendChild(tableBody);

  const tableFoot = document.createElement("tfoot");
  const errorRow = document.createElement("tf");
  const errorCell = document.createElement("td");
  errorCell.setAttribute("colSpan", "6");
  errorCell.style.textAlign = "right";
  errorCell.style.border = "none";
  errorCell.innerHTML = `${ticketErrs.length} tickets excluded due to data errors`;
  errorRow.appendChild(errorCell);
  tableFoot.appendChild(errorRow);

  reportTable.appendChild(tableFoot);

  //Return the HTML, serialized as a String, stripping out unnecessary whitespace and truncating spaces
  return reportTable.outerHTML.trim().replace(/([\n\r\t]+|\s{2,})/gm, "");
}
