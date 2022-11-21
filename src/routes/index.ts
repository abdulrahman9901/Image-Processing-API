import express from 'express';   
import images from './api/images';
const routes = express.Router();

routes.get('/', (req: any, res: any) => { 
    res.send("this is the main route ")
});

routes.use('/api',images)

export default routes;