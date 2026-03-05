import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER;

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            where: { username, active: true },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'full_name', 'role']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Tên đăng nhập không tồn tại hoặc tài khoản không hoạt động' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        const now = new Date();
        await user.update({ last_login: now });

        const token = jwt.sign(
            {
                id: user.id,
                employee_id: user.employee_id,
                role: user.employee.role,
                full_name: user.employee.full_name
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                role: user.employee.role,
                full_name: user.employee.full_name
            }
        });
            
    } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Login failed' });
        }
}

export const logout = (req, res) => {
  // Với JWT, logout chỉ cần client xóa token
  res.status(200).json({ message: "Đã đăng xuất" });
};

export const me = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    res.status(200).json({ user: decoded });
  } catch (e) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};