import jwt from 'jsonwebtoken';

export const requireLogin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};