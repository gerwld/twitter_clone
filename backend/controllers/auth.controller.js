import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signUp = async (req, res) => {
   try {
      const { username, fullname, email, password } = req.body;
      const emailRegex =
         /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!emailRegex.test(email)) {
         return res.status(400).json({ error: 'Invalid email format' });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
         return res.status(400).json({ error: 'Username is already in use' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
         return res.status(400).json({ error: 'Email is already in use' });
      }

      if (password.length < 6) {
         return res
            .status(400)
            .json({ error: 'Password should be at least 6 characters long' });
      }

      
      if (!fullname || fullname?.trim() == "") {
         return res.status(400).json({ error: 'Full name is required' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPwd = await bcrypt.hash(password, salt);
      
      const newUser = new User({
         username,
         email,
         fullname,
         password: hashedPwd,
      });

      if (newUser) {
         generateTokenAndSetCookie(newUser._id, res);
         await newUser.save();

         res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            fullname: newUser.fullname,
            followers: newUser.followers,
            following: newUser.following,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg,
         });
      } else {
         res.status(400).json({ message: 'Invalid user data' });
      }
   } catch (err) {
      console.log(`Error in auth.signUp controller: ${err.message}`);
      return res
         .status(500)
         .json({ success: false, message: 'Internal Server Error' });
   }
};

export const login = async (req, res) => {
   try {
      const { username, password } = req.body;
      if (!username || !password)
         return res.status(400).json({ message: 'All fields are required' });

      const user = await User.findOne({ username });
      if (!user) {
         return res.status(400).json({ message: 'Invalid username or password' });
      }

      const checkPassword = await bcrypt.compare(password, user?.password || '');      
      if (!checkPassword) {
         return res
            .status(400)
            .json({ message: 'Invalid username or password' });
      }

      generateTokenAndSetCookie(user._id, res);
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });

   } catch (err) {
      console.log(`Error in auth.login controller: ${err.message}`);
      return res
         .status(500)
         .json({ success: false, message: 'Internal Server Error' });
   }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Loggged out successfully"});
    } catch (err) {
        console.log(`Error in logout controller (auth.controller.js): ${err}`)
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const getMyself = async (req, res) => {
    try {
        const user = req.user;
        return res.json(user);
    } catch (err) {
        console.log(`Error in getMyself controller (auth.controller.js): ${err}`)
        res.status(500).json({message: "Internal Server Error"});
    }
}