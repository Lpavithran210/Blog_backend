import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    tags: {
        type: [String],
        required: true
    },
},{timestamps: true})

const blogModel = mongoose.model("Post", blogSchema)

export default blogModel