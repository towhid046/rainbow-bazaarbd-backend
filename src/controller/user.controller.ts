// dependencies
import {Request, Response} from 'express';
import { z } from 'zod';
import { User } from '../models/User.model';
import { zodUserSchema } from '../schemas/User.schema';
import setCookie from '../utils/setCookie';

export const registerUserHandler = async (req: Request, res: Response) => {
    try {
        // ✅ Validate user input with Zod using parse()
        const validUserData = zodUserSchema.parse({ ...req.body, role: "member" });

        // ✅ Extract validated data
        const { name, email, password, role } = validUserData;

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists!' });
            return;
        }

        // ✅ Create new user
         await User.create({ name, email, password, role });

        // ✅ Set cookie
        await setCookie(req,res)

        // ✅ Send response
        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error creating user:', error);
        
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }

        // Handle other errors
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserHandler = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password -__v');
        res.status(200).send(users)
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
}

export const checkAdmin = async (req:Request, res: Response) => {
    res.send({isAdmin: true})
}

export const loginUserHandler = async (req: Request, res: Response) => {
    try{
        setCookie(req,res);
        res.send({message: "User logged in successfully"});
    }catch(error){
        res.status(500).send({message: "Internal Server Error"});
    }
}

export const logoutHandler = async (req: Request, res: Response) => { 
    try {
        res.clearCookie('token');
        res.status(200).send({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
