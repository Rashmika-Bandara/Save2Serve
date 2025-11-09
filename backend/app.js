
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./Routes/auth');
app.use('/api/auth', authRoutes);

// Use environment variable for MongoDB connection, force IPv4 to avoid connection issues
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Save2Serve";

mongoose.connect(MONGO_URI, {
    family: 4  // Force IPv4
})
    .then(() => {
        console.log("Connected to MongoDB (Save2Serve database)");
        app.listen(4000, () => console.log('Server running on port 4000'));
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

