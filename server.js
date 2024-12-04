const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/lsuParking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
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
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const { scrapeParkingData } = require('./parking-scraper');

// Add this new route
app.post('/api/update', async (req, res) => {
    try {
        const data = await scrapeParkingData();
        await ParkingLot.deleteMany({});
        await ParkingLot.insertMany(data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});