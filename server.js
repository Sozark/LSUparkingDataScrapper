const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { scrapeParkingData } = require('./parking-scraper');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/lsuParking')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// Define Schema
const ParkingLotSchema = new mongoose.Schema({
    lotName: { type: String, required: true, unique: true },
    availability: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

const ParkingLot = mongoose.model('ParkingLot', ParkingLotSchema);

// Routes
app.get('/api/lots', async (req, res) => {
    try {
        const lots = await ParkingLot.find();
        console.log('Found lots:', lots); // Debug log
        res.json(lots);
    } catch (error) {
        console.error('Error getting lots:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/update', async (req, res) => {
    try {
        const data = await scrapeParkingData();
        console.log('Scraped data:', data);
        
        const operations = data.map(lot => ({
            updateOne: {
                filter: { lotName: lot.lotName },
                update: { $set: lot },
                upsert: true
            }
        }));

        await ParkingLot.bulkWrite(operations);
        res.json({ 
            success: true,
            message: 'Parking data updated',
            count: data.length,
            data: data // Send back the data
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));