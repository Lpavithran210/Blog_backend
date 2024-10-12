import cloudinary from "../config/cloudinary.js";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";

export const addPost = async (req, res) => {
    const { title, desc, content, tags } = req.body;
    try {
        if (!title || !desc || tags.length < 1) {
            return res.status(400).json({ message: 'Please enter all the mandatory fields!' });
        }
        
        let bannerImgUrl = null;
        
        if(!req.file){
            return res.status(400).json({ message: 'Please upload a banner image' });
        }
        
        if (req.file) {
            bannerImgUrl = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'blog_banners' },
                    (error, result) => {
                        if (error) {
                            reject(new Error('Cloudinary upload failed'));
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                ).end(req.file.buffer);
            });
        }

        let blog = await blogModel.create({ 
            title, 
            desc, 
            tags, 
            content, 
            banner: bannerImgUrl, 
            author: req.user._id 
        });

        res.status(201).json({ message: "New blog has been created", data: blog });
        await userModel.findByIdAndUpdate(req.user._id, { $push: { blogs: blog._id } });
    } catch (e) {
        console.log(e.message);
        res.status(400).json({ message: "Error while creating the blog" });
    }
}

export const getAllPosts = async (req, res) => {
    const response = await blogModel.find().populate('author', 'personal_info.name personal_info.profile_pic')
    if(!response){
        res.json({message: 'No blogs posted'})
    }
    res.json({data: response})
}

export const getUserPosts = async (req, res) => {
    const {id} = req.params
    const response = await blogModel.find({author: id}).populate('author', 'personal_info.name personal_info.profile_pic')
    if(!response){
       return res.json({message: 'No blogs posted', data: []})
    }
    res.json({data: response})
}

export const deletePost = async (req, res) => {
    const {id} = req.params
    try{
        const blog = await blogModel.findById(id)
    if(!blog){
       return res.json({message: 'Blog not found'})
    }
    await blogModel.findByIdAndDelete(id)
    await userModel.updateOne({blogs: id}, {$pull: {blogs: id}})
    res.json({message: 'Blog deleted successfully'})
    } catch(e) {
        console.log(e)
        res.status(500).json({ message: 'Server error, could not delete blog' });
    }
}

export const viewPost = async (req, res) => {
    const {id} = req.params
    try{
        const blog = await blogModel.findById(id)
    if(!blog){
       return res.json({message: 'Blog not found'})
    }
    const data = await blogModel.findById(id).populate('author', 'personal_info.name personal_info.user_name personal_info.profile_pic')
    res.json({message: 'Blog fetched successfully', data})
    } catch(e) {
        console.log(e)
        res.status(500).json({ message: 'Server error, could not fetch blog' });
    }
}