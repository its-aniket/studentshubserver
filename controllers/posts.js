import Post from "../models/Post.js";
import User from "../models/User.js";
import { google } from "googleapis";
import stream from "stream";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs'
import dotenv from "dotenv";
import { file } from "googleapis/build/src/apis/file/index.js";
/* CREATE */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const createPost = async (req, res) => {
  let fileId = null; // Declare fileId outside the try-catch block
  try {
    const { userId, description, code, attachmentPath } = req.body;
    if (req.file) {
      const CLIENT_ID = process.env.CLIENT_ID;
      const CLIENT_SECRET = process.env.CLIENT_SECRET;
      const REDIRECT_URI = process.env.REDIRECT_URI;
      const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      const drive = google.drive({
        version: "v3",
        auth: oauth2Client,
      });
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
  
      try {
        const response = await drive.files.create({
          requestBody: {
            name: req.file.originalname,
            mimeType: req.file.mimetype,
            parents: ["1Jgl1CC7leiZt9mlHNInXXb76RctmtZcJ"],
          },
          media: {
            mimeType: req.file.mimetype,
            body: bufferStream
          },
        });
        fileId = response.data.id; // Assign fileId inside the try block
        console.log(response.data);
      } catch (error) {
        console.log(error.message);
      }
    }
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      University: user.University,
      description,
      code,
      attachmentPath,
      userPicturePath: user.picturePath,
      picturePath: fileId, // Use fileId here
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const answerPost = async (req, res) => {
  const { postId } = req.params;
  const { ansCode, AnsDescription, userPicturePath, name } = req.body;
  let fileId = null; // Initialize fileId outside the try-catch block
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.file) {
      const CLIENT_ID = process.env.CLIENT_ID;
      const CLIENT_SECRET = process.env.CLIENT_SECRET;
      const REDIRECT_URI = process.env.REDIRECT_URI;
      const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      const drive = google.drive({
        version: "v3",
        auth: oauth2Client,
      });
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      try {
        const response = await drive.files.create({
          requestBody: {
            name: req.file.originalname,
            mimeType: req.file.mimetype,
            parents: ["1dLh4h-TOgqQRp19Qp2Te2xWB3tLPkXN7"],
          },
          media: {
            mimeType: req.file.mimetype,
            body: bufferStream,
          },
        });
        fileId = response.data.id; // Assign fileId inside the try block
        console.log(response.data);
      } catch (error) {
        console.log("Error uploading file:", error);
        // Handle error uploading file
      }
    }

    const answer = {
      ansCode,
      answerPicturePath: fileId,
      AnsDescription,
      userPicturePath,
      name,
    };

    post.answers.push(answer);

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).json({ message: "Failed to add answer to the post" });
  }
};

export const addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const { userId, text, userPicturePath, name } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Construct the comment object
    const comment = {
      userId,
      text,
      userPicturePath,
      name,
    };

    // Push the comment to the post's comments array
    post.comments.push(comment);

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  console.log(postId);

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await Post.find();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.find();
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    res.status(201).json(post);
  } catch (error) {
    console.error("Error finding post:", error);
    res.status(500).json({ message: "Failed to load post" });
  }
};
