import express from 'express'; 
import sharp from 'sharp';
import {promises as fsPromises} from 'fs';


const images = express.Router();

images.get('/images', function (req:any, res: any) {

    const filename:string =req.query.filename;
    const height:number=+req.query.height;
    const width:number =+req.query.width;

    const OriginalImage = sharp(`./assets/full/${filename}.jpg`);
    
    const sendImage =(res:any,image: Buffer) =>{
        
        res.setHeader('Content-Type', 'image/jpg');
        res.setHeader('Content-Length', ''); // Image size here
        res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
        res.send(image)
    }
    fsPromises.readFile(`./assets/thumb/${filename}-thumb.jpg`)
    .then((image)=>{      
        const img = sharp(image)
        img.metadata().then((data)=>{
            return data;
        }).then((info)=>{
        
            if (info.width == width, info.height == height){

            console.log("Already processed")
            
            sendImage(res,image);
            } 
            else {
                OriginalImage.resize(width,height).toFile(`./assets/thumb/${filename}-thumb.jpg`).then(async()=>{
                    
                    console.log("Already processed but with different dimensions")

                    const myFile = await fsPromises.readFile(`./assets/thumb/${filename}-thumb.jpg`);
                    
                    sendImage(res,myFile);
               
                })
            }
    })
       
        }).catch(()=>

        OriginalImage.resize(width,height).toFile(`./assets/thumb/${filename}-thumb.jpg`).then(async ()=>{

            console.log("not processed .")

            const myFile = await fsPromises.readFile(`./assets/thumb/${filename}-thumb.jpg`);
            
            sendImage(res,myFile);
            
        })
    )

  });

export default images;