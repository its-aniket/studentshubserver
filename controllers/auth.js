import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";
import dotenv from "dotenv";
import { google } from "googleapis";
import stream from "stream";
import path from "path";
import { fileURLToPath } from "url";
/* REGISTER USER */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const register = async (req, res) => {
  let fileId = "";
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      University,
      course,
    } = req.body;
    console.log(req.file);
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
            parents: ["1OVj5mpbmOC5ZTcDT8vpQFrIJHEfeNr4n"],
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

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: fileId,
      friends,
      University,
      course,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      alert("user does not exist");
      return res.status(400).json({ msg: "User does not exist. " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials. " });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
