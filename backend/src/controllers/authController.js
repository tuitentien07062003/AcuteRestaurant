import bcrypt from 'bcrypt';
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

        req.session.user = {
            id: user.id,
            employee_id: user.employee_id,
            role: user.employee.role,
            full_name: user.employee.full_name
        };

        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: req.session.user
        });
            
    } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Login failed' });
        }
}

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("pos.sid",
        {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        }
    );
    res.status(200).json({ message: "Đã đăng xuất" });
  });
};

export const me = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  res.status(200).json({ user: req.session.user });
};