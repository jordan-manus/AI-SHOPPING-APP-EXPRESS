import OpenAI from "openai";

const openai = new OpenAI();

async function main(prompt) {
    const response = await openai.createImage({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    });
    image_url = response.data.data[0].url;
}

main();