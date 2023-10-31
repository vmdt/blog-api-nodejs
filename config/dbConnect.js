const mongoose = require('mongoose');

// connect to db
const connectStr = process.env.DB_URL.replace('<password>', 
                process.env.DB_PASSWORD);

const connectDB = async () => {
    try {
        await mongoose.connect(connectStr);
        console.log('Connect to database successfully');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

connectDB();