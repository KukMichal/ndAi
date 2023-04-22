import { Configuration, OpenAIApi } from "openai";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import path from 'path';
import config from 'config';

const configuration = new Configuration({
  apiKey: config.chatGpt.apiKey,
});

const openai = new OpenAIApi(configuration);

// const GPT_MODEL = 'gpt-4';
const GPT_MODEL = 'gpt-3.5-turbo';
const EXTNAME = {
  PDF: '.pdf',
};

async function parsePdfToText(filePath) {;
  const converted = await pdf(filePath);
  return converted.text;
}

async function analyzeChatGPT(input, text) {
  return 'Test response';

  // const prompt = 'What is the governing law?';

  const prompt = 'Return exact word "1" if the text contains NDA provisions';
  const chatGptInput = {
    "role":"user",
    "content": `${prompt}: "${text}"`,
  };

  const response = await openai.createChatCompletion({
    model: GPT_MODEL,
    messages: [
      chatGptInput
    ],
  });

  const isNda = response.data.choices[0].message.content === '1';
  if (!isNda) {
    throw new Error('Invalid file - NDA was not detected.');
  }
  console.log(JSON.stringify(response.data.choices));

  return response.data.choices[0].message.content;
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
