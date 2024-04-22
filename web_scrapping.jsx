const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape Amazon
async function scrapeAmazon(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const items = [];

        // Find each product item on the page
        $('div.puis-card-container.s-card-container.s-overflow-hidden.aok-relative puis-include-content-margin.puis.puis-vbok7i09ua2q62ek5q2l21tt78.s-latency-cf-section puis-card-border').each((index, element) => {
            const item = {};

            // Get title
            item.title = $(element).find('span.a-size-medium.a-color-base.a-text-normal').text().trim();

            // Get image
            item.image = $(element).find('img.s-image').attr('src');

            // Get price
            item.price = $(element).find('span.a-price-decimal').text().trim();

            // Get URL
            item.url = $(element).find('a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').attr('href');

            // Get ratings
            item.rating = $(element).find('div.a-row.a-size-small');

            items.push(item);
        });

        return items;
    } catch (error) {
        console.error('Error:', error);
    }
}
