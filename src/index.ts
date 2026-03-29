import express from 'express';
import routes from './routes/index';

const app = express();

const port = parseInt(process.env.PORT || '3000', 10);

const getPort = (): number => port;

app.use('/', routes);

const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`server running on ${host}:${port}`));

export { app, getPort };
