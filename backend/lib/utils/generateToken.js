import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = async (userId, res) => {
   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '15d',
   });

   res.cookie("jwt", token, {
    httpOnly: true, // no-js, XSS attacts (cross-site scripting)
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15d
    secure: process.env.NODE_ENV !== 'development',
    sameSite: "strict" // CSRF attacks cross-site request forgery (cross-site forgery)
   })
};
