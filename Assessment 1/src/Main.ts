import data from "./TypeScript_Source_Data.json";
import { generateTeamSummaries } from "./TeamSummaryIngestion";
import { generateHTMLReport } from "./EmailTemplate";

/**
 * Parses the source source data and returns an js email object
 *
 * @param {object} dataIn - The ticket info json object
 * @returns {object} Email object formatted with ticket report in html body
 */
function dataParser(dataIn: object): object {
  //Pass the data
  const { teamSummaryMap, ticketErrsArr } = generateTeamSummaries(dataIn);

  //Build the email object, calling the html generator for the main body
  const emailMessage = {
    to: "null@odhsoha.oregon.gov", //Placeholder for assessment
    from: "null@gmail.com", //Placeholder for assessment
    subject: "Assessment Task 1", //Placeholder for assessment
    //Any additional field values
    body: {
      html: generateHTMLReport(teamSummaryMap, ticketErrsArr),
      text: "Placeholder for text", //Text representation of report data
    },
    attachments: [],
  };

  return emailMessage;
}

console.log(dataParser(data));
