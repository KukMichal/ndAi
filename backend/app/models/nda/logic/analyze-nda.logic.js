import { Configuration, OpenAIApi } from "openai";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import path from 'path';
import config from 'config';


const configuration = new Configuration({
  apiKey: config.chatGpt.apiKey,
});

const openai = new OpenAIApi(configuration);

const GPT_MODEL_4 = 'gpt-4';
const GPT_MODEL_3_5 = 'gpt-3.5-turbo';
const EXTNAME = {
  PDF: '.pdf',
};

async function parsePdfToText(filePath) {;
  const converted = await pdf(filePath);
  return converted.text;
}

async function analyzeChatGPT({ input }, text) {
  const prompt = 'Return exact word "1" if the text contains NDA provisions';
  const chatGptInput = {
    "role":"user",
    "content": `${prompt}: "${text}"`,
  };

  const response = await openai.createChatCompletion({
    model: GPT_MODEL_3_5,
    messages: [
      chatGptInput
    ],
  });

  const isNda = response.data.choices[0].message.content === '1';
  if (!isNda) {
    throw new Error('Invalid file - NDA was not detected.');
  }

  const prompt2 = `Complete this json {
    "governingLaw": {
      "match": return boolean if governing law is ${input.governingLaw}
      "line": exact line where governing law is defined,
      "start": exact first 5 words where governing law is defined,
      "end": exact last 5 words governing law is defined,
      "lineNumber": document line number where governing law is defined,
    },
    "term" : {
      "match": boolean is term set to ${input.term} years?, 
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

  console.log("PROMPT:", prompt2);
  const ndaAnalyzePrompt = {
    "role":"user",
    "content": `${prompt2}: "${text}"`,
  };


  console.log("MOCK Response");
  const resParsed = {
    "governingLaw": {
      "match": false,
      "line": "Governing law:",
      "start": "Governing law:",
      "end": "Governing law:",
      "lineNumber": 17
    },
    "term": {
      "match": true,
      "line": "Confidentiality period: [Number] [years/months]",
      "regex": "\\[Number\\] \\[years\\/months\\]"
    },
    "disputeMethod": {
      "line": "Dispute Resolution Method: [Litigation in the courts of jurisdiction] [Arbitration under the rules in legal place]",
      "match": false
    },
    "disclosure": {
      "line": "The Receiver may share the Confidential Information if required by law or regulation but must promptly notify the Discloser of the requirement if allowed by law or regulation.",
      "match": false,
      "match_int": null
    },
    "exclusion": {
      "line": "(d) Confidential Information does not include information that is: (i) in the public domain not by breach of this Agreement, (ii) known by the Receiver or its Permitted Receivers at the time of disclosure, (iii) lawfully obtained by the Receiver or its Permitted Receivers from a third party other than through a breach of confidence, (iv) independently developed by the Receiver, or (v) expressly indicated by the Discloser as not confidential.",
      "match": false,
      "match_int": null
    },
    "remedies": {
      "line": "(g) Equitable relief. The Discloser may seek injunctive relief or specific performance to enforce its rights under this Agreement.",
      "match": false,
      "match_int": null
    },
  };

  // const response2 = await openai.createChatCompletion({
  //   model: GPT_MODEL_4,
  //   messages: [
  //     ndaAnalyzePrompt
  //   ],
  //   temperature: 0,
  // });
  // const resParsed = response2.data.choices[0].message.content;

  console.log("RESPONSE:", resParsed);
  return {
    input,
    text,
    prompts: prompt2,
    response: resParsed,
  };
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
//
// (async () => {
//   const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
//   // const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/One-Page NDA.pdf');
//   // const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/Mutual NDA Two-Pages.pdf');
//   const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/NDA.pdf');
//
//   const text = await parsePdfToText(NDA_MOCK_PATH);
//   const input = {
//     input: {
//       governingLaw: 'czech',
//       disputeMethod: 'mediation',
//       disclosure: '[disclosure with prior written consent, disclosure to employees or agents]',
//       exclusions: '[information in the public domain, disclosure required by law]',
//       remedies: '[contractual fine, termination]',
//       term: 'czech',
//     },
//   };
//
//   analyzeChatGPT(input, text);
// })();
