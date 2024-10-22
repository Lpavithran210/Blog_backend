import mongoose from "mongoose";

const profile_img_collections = ["adventurer", "adventurer-neutral", "avataaars"]
const bgColor = ["ffdfbf", "d1d4f9", "c0aede", "b6e3f4", "ffd5dc"]
const userSchema = new mongoose.Schema({
    personal_info: {
        name: {
            type: String,
            required: true,
            unique: true
        },
        user_name: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            maxlength: 250,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        profile_pic: {
            type: String,
            default: () => `https://api.dicebear.com/9.x/${profile_img_collections[Math.floor(Math.random() * profile_img_collections.length)]}/svg?seed=${Math.floor(Math.random() * 10)}&backgroundColor=${bgColor[Math.floor(Math.random() * bgColor.length)]}`
        },
    },
    social_links: {
        facebook: {
            type: String,
            default: ""
        },
        instagram: {
            type: String,
            default: ""
        },
        twitter: {
            type: String,
            default: ""
        },
        youtube: {
            type: String,
            default: ""
        },
    },
    blogs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Blog",
        default: []
    },
    otp: String,
    otp_expires_at: Date,
    otp_verified: { type: Boolean, default: false },
},{timestamps: true})

const userModel = mongoose.model('User', userSchema)

export default userModel