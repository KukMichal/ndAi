import { Configuration, OpenAIApi } from "openai";
import { API_KEY } from "./config.js";
import { encode, decode } from 'gpt-3-encoder'

const configuration = new Configuration({
    apiKey: API_KEY,
});

const openai = new OpenAIApi(configuration);

/*
const decoded = decode(encoded)
console.log('We can decode it back into:\n', decoded)
 */

export async function getKeywords (text) {
    const encoded = encode(`Write 5 keywords in a numbered list:\n\n` + text);
    console.log("Encoded:", encoded);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: encoded,
        max_tokens: 1500,
        top_p: 1,
        temperature: 0.5,
        frequency_penalty: 0.8,
        presence_penalty: 0.0,
    });
    console.log("Sending output:", response.data.choices[0].text);
    return response.data.choices[0].text;
}


