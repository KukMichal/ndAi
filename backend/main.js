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

export async function getKeywords (prompt, text) {
    console.log("Sending input:", prompt, text)

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "write product/service description for: analysis of the overlap between fans versus users of a given group of influencers. They enter instagram profile names (2 & more) and the result will be at the level of each influencer how many unique fans they have in relation to the group and how many overlap with other influencers (see the slidedeck I sent by email)\n" +
            "profile tagging analysis - allows you to enter instagram profiles and we analyze who tagged the profile for them in terms of the selected period / number of recent posts and clearly display it online / allow xls export.",
        max_tokens: 1500,
        top_p: 1,
        temperature: 0.5,
        frequency_penalty: 0.8,
        presence_penalty: 0.0,
    });

    console.log("Sending output:", response.data.choices[0].text);
    return response.data.choices[0].text;
}


