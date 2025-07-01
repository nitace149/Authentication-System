import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js'

import connectDB from './Config/MongoDB.js';

const app = express();
const port = process.env.PORT || 3000;
// connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

//API EndPoint

app.get('/', (req, res) => {
  res.send('API Working!');
});
app.use('/api/auth', authRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
