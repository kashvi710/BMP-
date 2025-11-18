import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if(!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");

    if(bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {

        if (err) {
            return res.status(403).json({ message: "Invalid token!" });
        }

        req.user = user;
        next();
    });
}

export const authenticate_student_token = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if(!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");

    if(bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err ) { 
          console.log(err);
            return res.status(403).json({ message: "Invalid token!" });
        }
        if(user.role === 'Student'){
            req.user = user;
        } else {
            return res.status(403).json({ message: "Access Forbidden!" });
        }

        next();
    });
}

export const authenticate_examiner_token = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if(!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");

    if(bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) { 
          console.log(err);
            return res.status(403).json({ message: "Invalid token!" });
        }
        if(user.role === 'Examiner'){
            req.user = user;
        } else {
            return res.status(403).json({ message: "Access Forbidden!" });
        }

        next();
    });
}

export const authenticate_admin_token = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if(!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");

    if(bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err ) { 
          console.log(err);
            return res.status(403).json({ message: "Invalid token!" });
        }
        if(user.role === 'Admin'){
            req.user = user;
        } else {
            return res.status(403).json({ message: "Access Forbidden!" });
        }

        next();
    });
}