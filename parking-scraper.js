const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeParkingData() {
    try {
        const response = await axios.get('https://www.lsu.edu/parking/availability.php', {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const $ = cheerio.load(response.data);
        const parkingData = [];
        
        $('table tr').each((i, row) => {
            if (i === 0) return;
            
            const columns = $(row).find('td');
            if (columns.length < 2) return;
            
            const lotName = $(columns[0]).text().trim();
            const availabilityText = $(columns[1]).text().trim();
            const availabilityNumber = parseInt(availabilityText, 10);
            
            if (lotName && !isNaN(availabilityNumber)) {
                parkingData.push({
                    lotName: lotName,
                    availability: availabilityNumber,
                    lastUpdated: new Date()
                });
            }
        });
        
        console.log('Scraped data:', parkingData);
        return parkingData;
    } catch (error) {
        console.error('Error scraping parking data:', error);
        throw error;
    }
}

module.exports = { scrapeParkingData };