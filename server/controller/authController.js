import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../schema/userSchema.js";
import { generateToken } from "../generateToken.js";


// SIGNUP
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user exists
    const existingUser = await User.findOne({ email }).select("+password_hash");

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password_hash: hash
    });

    // generate JWT (clean reuse)
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({
      error: "Something went wrong"
    });
  }
};


// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password_hash");

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // generate JWT (clean reuse)
    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


// GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select("name email").select("+password_hash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};