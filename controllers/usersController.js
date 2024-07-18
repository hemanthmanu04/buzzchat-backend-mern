import { User } from "../model/UserModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });

    if (usernameCheck) {
      console.log("Username is already there bro");
      return res.json({ msg: "Username already in use.", status: false });
    }

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already in use.", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (exc) {
    next(exc);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const USER = await User.findOne({ username });

    if (!USER) {
      return res.json({ msg: "Incorrect Username/Password.", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, USER.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username/Password.", status: false });
    delete USER.password;

    return res.json({ status: true, USER });
  } catch (exc) {
    next(exc);
  }
};

export const setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;

    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (exc) {
    next(exc);
  }
};

export const getAllusers = async (req, res, next) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const users = await User.find({ _id: { $ne: objectId } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    console.log(users);
    return res.json(users);
  } catch (exc) {
    next(exc);
  }
};
