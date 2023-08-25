import jwt from 'jsonwebtoken';
import { SECRET } from '../config.js';

export function crearToken(payload) {
   
   return new Promise((resolve, reject) => {
     jwt.sign(payload,
     SECRET,
     { 
       expiresIn: 60 * 60 * 24
   }, (err, token) => {
       if(err) reject(err);
         resolve(token);
        
      
   })
})
}
