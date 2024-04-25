import express from "express";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  addCommentToPost,
  answerPost,
  deletePost,
  getPost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

// router.get("/posts/search/:key",verifyToken,async (req,res)=>{
//   console.log("woring!!")
//   const data = await post.find()
//   res.send(data)
// });

router.post("/:postId/comment", verifyToken, addCommentToPost);

router.delete("/delete/:postId", verifyToken, deletePost);
router.get("/:postId", verifyToken, getPost);
const upload = multer();

router.post(
  "/:postId/answer",
  verifyToken,
  upload.single("picture"),
  answerPost
);
export default router;
