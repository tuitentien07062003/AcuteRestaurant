import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Employee } from "../models/Employee.js";
import { Op } from "sequelize";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
        include: [
            {
                model: Employee,
                as: "employee",
                attributes: ['id', 'full_name', 'role']
            }
        ],
        order: [['id', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Get all users failed" });
  }
};


export const createUser = async (req, res) => {
  try {
    const { employee_id, username, password } = req.body;

    if (!employee_id || !username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
            { employee_id },
            { username }
        ]
    }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Nhân viên này đã có tài khoản hoặc tên đăng nhập đã được sử dụng"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      employee_id: employee_id,
      username: username,
      password: hashedPassword
    });

    res.status(201).json({  message: "Tài khoản người dùng đã được tạo!" });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Create user failed" });
  }
};
