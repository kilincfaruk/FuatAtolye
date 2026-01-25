import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());

// Cache for gold price
let cachedGoldPrice = null;
let lastUpdate = null;

// Function to scrape gold price
async function fetchGoldPrice() {
    try {
        const response = await axios.get('https://www.altinkaynak.com/Altin/Kur/Guncel', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Try to find the price using table structure
        // The XPath /html/body/form/div[5]/div/div/div[1]/div/div/div/table/tbody/tr[1]/td[4]
        // translates to: first row, 4th column of the first table in the page
        const price = $('table tbody tr:first-child td:nth-child(4)').text().trim();

        if (price) {
            cachedGoldPrice = price;
            lastUpdate = new Date().toISOString();
            console.log(`✅ Gold price updated: ${price} at ${new Date().toLocaleTimeString('tr-TR')}`);
        } else {
            console.log('⚠️ Could not find gold price in the expected location');
        }
    } catch (error) {
        console.error('❌ Error fetching gold price:', error.message);
    }
}

// API endpoint
app.get('/api/gold-price', (req, res) => {
    res.json({
        price: cachedGoldPrice,
        lastUpdate: lastUpdate,
        status: cachedGoldPrice ? 'success' : 'pending'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Initial fetch
fetchGoldPrice();

// Update every 10 seconds
setInterval(fetchGoldPrice, 10000);

app.listen(PORT, () => {
    console.log(`🚀 Gold Price API server running on http://localhost:${PORT}`);
    console.log(`📊 Fetching gold price every 10 seconds...`);
});
