import data from "./TypeScript_Source_Data.json";
import { generateTeamSummaries } from "./TeamSummaryIngestion";
import { generateHTMLReport } from "./EmailTemplate_v2";

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
    to: "JORDAN.R.REICH@odhsoha.oregon.gov", //Placeholder for assessment
    from: "thewiltonator@gmail.com", //Placeholder for assessment
    subject: "Assessment Task 1", //Placeholder for assessment
    //Any additional field values
    body: {
      html: generateHTMLReport(teamSummaryMap, ticketErrsArr),
    },
    attachments: [],
  };

  return emailMessage;
}

// dataParser(data);
console.log(dataParser(data));
