import express from 'express';
import routes from './routes/index';
const app = express();

const port = 3000;

const getPort = (): number => port;

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.listen(port, () => console.log(`server running on port ${port}`));

export { app, getPort };
