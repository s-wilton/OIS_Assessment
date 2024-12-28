import data from "./TypeScript_Source_Data.json";
import { generateTeamSummaries } from "./TeamSummaryIngestion";
import { generateHTMLReport } from "./EmailTemplate";

/**
 * Parses the source source data and returns an js email object
 * @param {object} dataIn - The ticket info json object
 * @returns {object} Email object formatted with ticket report in html body
 */
function dataParser(dataIn: object): object {
  const { teamSummaryMap, ticketErrsArr } = generateTeamSummaries(dataIn);

  const emailMessage = {
    to: "null@odhsoha.oregon.gov", //Placeholders for assessment
    from: "null@gmail.com",
    subject: "Assessment Task 1",
    body: {
      html: generateHTMLReport(teamSummaryMap, ticketErrsArr),
      text: "Placeholder for text", //TODO: Generate text in same function that generates HTML
    },
    attachments: [],
  };

  return emailMessage;
}

// dataParser(data);
// console.log(dataParser(data));
