import jwt from 'jsonwebtoken';
import { SECRET } from '../config.js';

export const autorizar = (req, res, next) => {
    try {
        const  token  = req.headers.token;
    
        if (!token)
          return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    
        jwt.verify(token, SECRET, (error, user) => {
          if (error) {
            return res.status(401).json({ message: "Token is not valid" });
          }
          req.user = user;
          next();
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
};

