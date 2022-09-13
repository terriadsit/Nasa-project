const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://nasa-api:nfLd3l7iGipDWgOv@cluster0.lz04i.mongodb.net/nasa?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
}
