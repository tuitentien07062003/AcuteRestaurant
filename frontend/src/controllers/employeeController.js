import { Employee } from "../models/Employee.js";
import { Op } from "sequelize";

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.status(200).json(employees);
    }
    catch (error) {
        console.error("Lỗi lấy nhân viên:", error);
        res.status(500).json({ message: 'GetAll Error', error: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        !employee
            ? res.status(404).json({ message: "Không tìm thấy nhân viên" })
            : res.status(200).json(employee);
    }
    catch (error) {
        console.error("Lỗi lấy nhân viên:", error);
        res.status(500).json({ message: 'GetById Error', error: error.message });
    }
};

export const getEmployeeBySeacrh = async (req, res) => {
    try {
        const { keyword } = req.query;
        const employees = await Employee.findAll({
            where: {
                [Op.or]: [
                { full_name: { [Op.iLike]: `%${keyword}%` } },
                { phone: { [Op.iLike]: `%${keyword}%` } },
                { employee_id: { [Op.iLike]: `%${keyword}%` } }
            ]
        },
        order: [['full_name', 'DESC']]
        });
        if (employees.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên nào" });
        }
        res.status(200).json(employees);
    }
    catch (error) {
        console.error("Lỗi khi tìm kiếm nhân viên:", error);
        res.status(500).json({ message: 'Search Error', error: error.message });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const { full_name, phone, role, type, base_salary, hourly_rate, contract_end } = req.body;
        const employees = new Employee({ full_name, phone, role, type, base_salary, hourly_rate, contract_end });
        const savedEmployee = await employees.save();
        res.status(201).json({ message: 'Nhân viên đã được thêm!' });
    }
    catch (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        res.status(500).json({ message: 'Create Error', error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { full_name, phone, role, type, base_salary, hourly_rate, contract_end } = req.body;
        const [updatedEmployee] = await Employee.update(
            { 
                full_name, 
                phone, 
                role, 
                type, 
                base_salary, 
                hourly_rate, 
                contract_end
            },
            { where: { id: req.params.id },
            returning: true }
        );
        
        if(updatedEmployee === 0) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên"});
        }
        res.status(200).json({ message: "Thông tin nhân viên đã được cập nhật!" });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật nhân viên: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

export const activeEmployee = async (req, res) => {
    try {
        const { active } = req.body;
        const [activedEmployee] = await Employee.update(
            { active },
            { where: { id: req.params.id } }
        );

        if(activedEmployee === 0) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên"});
        }
        return res.status(200).json({ message: "Đã cập nhật trạng thái nhân viên: " + (active ? "Kích hoạt" : "Vô hiệu hóa") });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật nhân viên: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

export const salaryEmployee = async (req, res) => {
    try {
        const { hourly_rate } = req.body;
        const [salaryedEmployee] = await Employee.update(
            { hourly_rate },
            { where: { id: req.params.id } }
        );
        if(salaryedEmployee === 0) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên"});
        }
        res.status(200).json({ message: "Lương nhân viên đã được cập nhật!" });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật nhân viên: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};