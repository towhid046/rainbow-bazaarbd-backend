import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express';

const hashPassword = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { password } = req.body;
        if (!password) {
            res.status(403).json({ message: "There is a problem in your request!" });
            return;
        }
        req.body.password = await bcrypt.hash(password, 14);
        next();
    } catch (error) {
        next(error);
    }
};

export default hashPassword;