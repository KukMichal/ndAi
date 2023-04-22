import { Configuration, OpenAIApi } from "openai";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import path from 'path';
import config from 'config';
import url from 'url';


const configuration = new Configuration({
  apiKey: config.chatGpt.apiKey,
});

const openai = new OpenAIApi(configuration);

const GPT_MODEL = 'gpt-4';
// const GPT_MODEL = 'gpt-3.5-turbo';
const EXTNAME = {
  PDF: '.pdf',
};

async function parsePdfToText(filePath) {;
  const converted = await pdf(filePath);
  return converted.text;
}

async function analyzeChatGPT(input, text) {
  const prompt = 'Return exact word "1" if the text contains NDA provisions';
  // const chatGptInput = {
  //   "role":"user",
  //   "content": `${prompt}: "${text}"`,
  // };
  //
  // const response = await openai.createChatCompletion({
  //   model: GPT_MODEL,
  //   messages: [
  //     chatGptInput
  //   ],
  // });
  //
  // const isNda = response.data.choices[0].message.content === '1';
  // if (!isNda) {
  //   throw new Error('Invalid file - NDA was not detected.');
  // }

  const prompt2 = `Complete this json {
    "governingLaw": {
      "match": return boolean if governing law is ${input.governingLaw}
      "line": exact line where governing law is defined,
      "start": exact first 5 words where governing law is defined,
      "end": exact last 5 words governing law is defined,
      "lineNumber": document line number where governing law is defined,
    },
    "term" : {
      "isExactNumber": boolean is term limited by exact years or months?, 
      "line": exact line how long does the contract last,
      "regex": return the shortest possible regular expression that searches the line,
    },
    "disputeMethod": {
      "line: return line where dispute resolution method is defined,
      "match": return boolean if dispute resolution method is ${input.disputeMethod},
    },
    "disclosure": {
      "line": return line where permission of disclosure is defined,
      "match": return boolean if dispute resolution method at least one of ${input.disclosure},
      "match_int": return index of ${input.disclosure} that are permitted disclosure methods,
    },
    "exclusion": {
      "line": return line where exclusion is defined,
      "match": return boolean if exclusions is ${input.exclusions},
      "match_int": return list of the following ${input.exclusions} which are true,
    }
    "remedies: {
      "line": return line where remedies for breach are difend,
      "match": return boolean if remedies for breach is ${input.remedies},
      "match_int": which of the following remedies for breach ${input.remedies} are possible,
    }
  }.`;
    // "scope": Is this an open ended definition of confidential information for the purpose of a non disclosure agreement?

  // console.log("Sending mock response.");
  // return {
  //  "governingLaw": "the State of",
  //  "governingLawMatch": false,
  //  "governingLawLine": "13. Applicable Law: This Agreement is made under, and shall be construed to, the laws of the State of",
  //  "governingLawStart": "13. Applicable Law: This Agreement",
  //  "governingLawEnd": "laws of the State of",
  //  "governingLawLineNumber": 13,
  //  "termIsExactNumber": false,
  //  "termLine": "6. Term: This Agreement and Recipient’s duty to hold Discloser’s trade secrets in confidence shall remain in effect until the above-described trade secrets are no longer trade secrets or until Discloser sends Recipient written notice releasing Recipient from this Agreement, whichever occurs first."
  //};

  console.log("PROMPT:", prompt2);
  const getGoverningPositionPrompt = {
    "role":"user",
    "content": `${prompt2}: "${text}"`,
  };

  // throw new Error('NOT IMPLEMENTED');

  const response2 = await openai.createChatCompletion({
    model: GPT_MODEL,
    messages: [
      getGoverningPositionPrompt
    ],
    temperature: 0,
  });

  console.log(response2.data.choices[0].message.content);
}

export async function analyze(input) {
  const fileExtname = path.extname(input.file.name).toLowerCase();

  let text;
  if (fileExtname === EXTNAME.PDF) {
    text = await parsePdfToText(input.file.data);
  } else {
    throw new Error('Invalid file type - only PDF is allowed.');
  }

  const response = await analyzeChatGPT(input, text);
  return response;
}

(async () => {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  // const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/One-Page NDA.pdf');
  // const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/Mutual NDA Two-Pages.pdf');
  const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/NDA.pdf');

  const text = await parsePdfToText(NDA_MOCK_PATH);
  const input = {
    governingLaw: 'czech',
    disputeMethod: 'mediation',
    disclosure: '[disclosure with prior written consent, disclosure to employees or agents]',
    exclusions: '[information in the public domain, disclosure required by law]',
    remedies: '[contractual fine, termination]',
    term: 'czech',
  };

  analyzeChatGPT(input, text);
})();
