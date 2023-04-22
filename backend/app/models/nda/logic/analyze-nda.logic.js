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
    "governingLaw": string, 
    "governingLawMatch": return boolean if governing law is ${input.governingLaw},
    "governingLawLine": exact line where governing law is defined,
    "governingLawStart": exact first 5 words where governing law is defined,
    "governingLawEnd": exact last 5 words governing law is defined,
    "governingLawLineNumber": document line number where governing law is defined,
    "termIsExactNumber": boolean is term limited by exact years or months?, 
    "termLine": exact line how long does the contract last
  }.`;
    // "scope": Is this an open ended definition of confidential information for the purpose of a non disclosure agreement?

  console.log("Sending mock response.");
  return {
    "governingLaw": "the State of",
    "governingLawMatch": false,
    "governingLawLine": "13. Applicable Law: This Agreement is made under, and shall be construed to, the laws of the State of",
    "governingLawStart": "13. Applicable Law: This Agreement",
    "governingLawEnd": "laws of the State of",
    "governingLawLineNumber": 13,
    "termIsExactNumber": false,
    "termLine": "6. Term: This Agreement and Recipient’s duty to hold Discloser’s trade secrets in confidence shall remain in effect until the above-described trade secrets are no longer trade secrets or until Discloser sends Recipient written notice releasing Recipient from this Agreement, whichever occurs first."
  };

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
  const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/One-Page NDA.pdf');

  const text = await parsePdfToText(NDA_MOCK_PATH);
  const input = {
    governingLaw: 'czech',
    term: 'czech',
  };

  analyzeChatGPT(input, text);
})();


