import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
});

connectDB();

app.get('/', (req, res) => {
  res.send('✅ Server is up and running!');
});

const port = process.env.PORT || 8000;

app.listen(port || 8000 , () => {
    console.log(`Server is running on http://localhost:${port}`);
});