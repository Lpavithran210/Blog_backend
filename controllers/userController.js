import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import userModel from "../models/userModel.js";
import { sendMail } from '../email.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerUser = async (req, res) => {
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    const validEmail = emailRegex.test(email)
    const validPassword = passwordRegex.test(password)

    if (!name || !email || !password) {
        return res.status(400).json({message:"Please fill all the mandatory fields!"})
    }
    if (!validEmail) {
        return res.status(400).json({message:"Please enter a valid email"})
    }
    if (!validPassword) {
        return res.status(400).json({message:"Password must contain 8 chars and must contain 1 number, 1 special character, 1 uppercase and 1 lowercase letter"})
    }
    try {
        const userEmailExists = await userModel.findOne({ "personal_info.email": email })
        const userNameExists = await userModel.findOne({ "personal_info.user_name": name })
        if (userNameExists) {
            return res.status(400).json({message:"Username is already taken"})
        }
        if (userEmailExists) {
            return res.status(400).json({message:"Email is already registered"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await userModel.create({ personal_info: { name, user_name: name, email, password: hashedPassword } })
        res.status(201).json({ message: 'User registered successfully', data: {...user.personal_info, userId: user._id, total_blogs: user.blogs.length, createdAt: user.createdAt, accessToken: generateToken(user._id)} })
    } catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
}

export const loginUser = async (req, res) => {
    const email = req.body.email.trim()
    const password = req.body.password.trim()

    const validEmail = emailRegex.test(email)
    const validPassword = passwordRegex.test(password)

    try {
        if (!validEmail) {
            res.status(400)
            throw new Error("Please enter a valid email")
        }
        if (!validPassword) {
            res.status(400)
            throw new Error("Password must contain 8 chars and must contain 1 number, 1 special character, 1 uppercase and 1 lowercase letter")
        }
        const user = await userModel.findOne({ "personal_info.email": email })
        if (!user) {
            res.status(400)
            throw new Error("Email not registered")
        }
        if (user && await bcrypt.compare(password, user.personal_info.password)) {
            res.json({ message: "User login successfull", data: {...user.personal_info, userId: user._id, total_blogs: user.blogs.length, createdAt: user.createdAt, accessToken: generateToken(user._id)}})
        } else {
            res.status(400)
            throw new Error("Invalid password")
        }
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ message: e.message })
    }
}

export const getUserDetails = async (req, res) => {
    const {name} = req.params
    const data = await userModel.findOne({'personal_info.name': name})
    res.json({data: data})
}

export const updateUserDetails = async (req, res) => {
    const {userId, name, email, bio, userName, fbUrl, instaUrl, twitterUrl, youtubeUrl} = req.body
    const data = await userModel.findByIdAndUpdate(userId, {
        $set: {
            'personal_info.name': name,
            'personal_info.email': email,
            'personal_info.bio': bio,
            'personal_info.user_name': userName,
            'social_links.facebook': fbUrl,
            'social_links.instagram': instaUrl,
            'social_links.twitter': twitterUrl,
            'social_links.youtube': youtubeUrl
        }
    })
    res.json({message: 'Profile updated successfully'})
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const validEmail = emailRegex.test(email);
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!validEmail) {
            return res.status(400).json({ message: "Please enter a valid email" });
        }
        const user = await userModel.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

        await userModel.findOneAndUpdate(
            { "personal_info.email": email },
            { otp: hashedOTP, otp_expires_at: otpExpiry }
        );

        res.render('otp', { otp, name: user.personal_info.name }, async (err, html) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error rendering template" });
            }
            try {
                await sendMail('ragavikaruna20@gmail.com', "Forgot Password Request - Your OTP Code", html);
                return res.json({ message: "OTP has been sent successfully" });
            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Error sending email" });
            }
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const verifyOTP = async (req, res) => {
    const {email, otp} = req.body
    const user = await userModel.findOne({"personal_info.email":email})
    const isMatch = await bcrypt.compare(otp, user.otp)
    const currentTime = new Date()
    if(isMatch){
        if(currentTime <= user.otp_expires_at){
            return res.json({message: "OTP verified"})
        } else {
            return res.status(400).json({message: "OTP is expired"})
        }
    }
    else{
        res.status(400).json({message: 'Wrong OTP'})
    }
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "6h" })
}