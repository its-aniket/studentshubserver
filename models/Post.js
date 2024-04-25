import mongoose from "mongoose";
// Import the User model from its file

const { Schema } = mongoose;

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference the User model
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userPicturePath: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
});

const answerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference the User model
    
  },
  ansCode: String,
  answerPicturePath: String,
  AnsDescription: {
    type: String,
    // required:true
  },
  userPicturePath: {
    type: String,
    // required:true
  },
  name: {
    type: String,
    // required:true
    
  },
});
const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    University: String,
    description: String,
    code: String,
    attachmentPath: String,
    picturePath: String,
    userPicturePath: String,
    answers:[answerSchema],
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [commentSchema], // Array of comment documents
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
