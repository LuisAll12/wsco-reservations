import express from 'express';
import router from '@/routes/handler';
import coockieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(coockieParser());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
