import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.annuaire-gratuit.ma';
const OUTPUT_FILE = path.join(__dirname, '../data/fes_pharmacies_scraped.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return cheerio.load(data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(`Page not found: ${url}`);
            return null;
        }
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

async function scrapePharmacies() {
    const pharmacies = [];
    const uniqueLinks = new Set();
    let page = 1;

    console.log(`Starting multi-page scrape for Fes...`);

    while (true) {
        const url = `${BASE_URL}/pharmacies/_fes-pg${page}`;
        console.log(`\n📄 Scraping Page ${page}: ${url}`);

        const $ = await fetchPage(url);
        if (!$) {
            console.log('Stopping scrape (page not found or error).');
            break;
        }

        const pageLinks = [];
        $('a[href*="/pharmacies/pharmacie-"]').each((i, el) => {
            const link = $(el).attr('href');
            if (link && !uniqueLinks.has(link)) {
                uniqueLinks.add(link);
                pageLinks.push(link);
            }
        });

        if (pageLinks.length === 0) {
            console.log('No more pharmacy links found. Stopping.');
            break;
        }

        console.log(`Found ${pageLinks.length} new pharmacy links on page ${page}.`);

        // Scrape details for each link found on this page
        for (const link of pageLinks) {
            const fullLink = link.startsWith('http') ? link : `${BASE_URL}${link}`;
            // console.log(`Scraping details: ${fullLink}`); // Verbose

            const $detail = await fetchPage(fullLink);
            if (!$detail) continue;

            const name = $detail('h1').text().trim();

            // Phone extraction
            let phone = '';
            const phoneLink = $detail('a[href^="tel:"]').first().attr('href');
            if (phoneLink) {
                phone = phoneLink.replace('tel:', '');
            } else {
                const bodyText = $detail('body').text();
                const phoneMatch = bodyText.match(/(0[567][0-9]{8})/);
                if (phoneMatch) phone = phoneMatch[0];
            }

            // Address extraction
            let address = '';
            const contentText = $detail('.content').text() || $detail('body').text();
            const addressMatch = contentText.match(/Adresse\s*:\s*([^.\n]+)/i);
            if (addressMatch) {
                address = addressMatch[1].trim();
            } else {
                address = 'Fes';
            }

            // Coordinates extraction
            let coordinates = null;
            const mapLink = $detail('a[href*="maps.google.com"], a[href*="google.com/maps"]').attr('href');
            if (mapLink) {
                const latLngMatch = mapLink.match(/q=([0-9.-]+),([0-9.-]+)/);
                if (latLngMatch) {
                    coordinates = {
                        lat: parseFloat(latLngMatch[1]),
                        lng: parseFloat(latLngMatch[2])
                    };
                }
            }

            // Only add if ALL required fields are present
            if (name && phone && address && coordinates && address !== 'Fes') {
                pharmacies.push({
                    name,
                    address,
                    phone,
                    city: 'Fes',
                    coordinates,
                    scrapedUrl: fullLink
                });
                process.stdout.write('.'); // Progress dot
            } else {
                process.stdout.write('x'); // Skipped
            }

            await sleep(500); // Be polite but faster
        }

        console.log(`\nPage ${page} done.`);
        page++;
        await sleep(1000); // Wait between pages
    }

    console.log(`\n\n✅ Scraped ${pharmacies.length} TOTAL pharmacies.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pharmacies, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

scrapePharmacies();
