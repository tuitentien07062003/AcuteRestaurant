import { Employee } from "../models/Employee.js";
import { Timesheet } from "../models/Timesheet.js";
import { Op } from "sequelize";

const getVNTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
};

const end_hour = 23;
const end_minute = 59;

export const getTimesheets = async (req, res) => {
    try {
        const timesheets = await Timesheet.findAll({
            include: [
                {
                    model: Employee,
                    as: "employee",
                    attributes: ['id', 'full_name', 'internal_id']
                }   
            ],
            order: [['work_day', 'DESC'], ['check_in', 'DESC']]
        });

        res.status(200).json(timesheets);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Lỗi server"});
    }
};

export const checkInOut = async (req, res) => {
    try {
        const { internal_id } = req.body;
        const employee = await Employee.findOne({ where: { internal_id } });

        if (!employee) {
            return res.status(404).json({ message: "Nhân viên không tồn tại" });
        }

        // 1. Đóng các ca của những ngày trước (nếu có)
        await closePreviousOpenShifts(employee.id);

        const now = getVNTime();
        
        // 2. Xác định mốc thời gian bắt đầu và kết thúc của ngày hôm nay (VN Time)
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);

        const endToday = new Date(now);
        endToday.setHours(end_hour, end_minute, 59, 999);

        // 3. Tìm ca làm việc trong ngày hôm nay
        let todayShift = await Timesheet.findOne({
            where: {
                employee_id: employee.id,
                work_day: {
                    [Op.between]: [startToday, endToday]
                }
            }
        });

        if (!todayShift) {
            // Thực hiện Check-in
            todayShift = await Timesheet.create({
                employee_id: employee.id,
                work_day: now,
                check_in: now,
                check_out: null,
            });

            return res.status(200).json({ 
                message: "Check-in thành công", 
                type: "CHECK_IN", 
                time: todayShift.check_in 
            });
        }

        // 4. Thực hiện Check-out
        if (!todayShift.check_out) {
            const checkOutTime = getVNTime();
            // Tính toán số giờ dựa trên timestamp thực tế
            const diffInMs = checkOutTime.getTime() - new Date(todayShift.check_in).getTime();
            const totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2);

            await todayShift.update({
                check_out: checkOutTime,
                total_hours: totalHours
            });

            return res.status(200).json({ 
                message: "Check-out thành công", 
                type: "CHECK_OUT", 
                total_hours: totalHours 
            });
        }

        return res.status(400).json({ message: "Ca làm việc hôm nay đã hoàn tất" });
        
    } catch (err) {
        console.error("Lỗi Check-in/Out:", err);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// Hàm đóng các ca mở của các ngày trước
const closePreviousOpenShifts = async (employeeId) => {
    try {
        const now = getVNTime();
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);

        // Tìm tất cả ca mở có ngày làm việc nhỏ hơn ngày hôm nay
        const openShifts = await Timesheet.findAll({
            where: {
                employee_id: employeeId,
                check_out: null,
                work_day: {
                    [Op.lt]: startToday
                }
            }
        });

        if (openShifts.length === 0) return;

        for (const shift of openShifts) {
            // Đặt giờ đóng ca là 23:59:59 của CHÍNH NGÀY làm việc đó
            const closeTime = new Date(shift.work_day);
            closeTime.setHours(23, 59, 59, 999);

            const checkInTime = new Date(shift.check_in);
            const diffInMs = closeTime.getTime() - checkInTime.getTime();
            
            // Đảm bảo không bị số âm nếu có lỗi dữ liệu đầu vào
            const totalHours = diffInMs > 0 ? (diffInMs / (1000 * 60 * 60)).toFixed(2) : 0;

            await shift.update({
                check_out: closeTime,
                total_hours: totalHours
            });

            console.log(`[Auto-Close] Đã đóng ca cũ ngày ${shift.work_day.toISOString().split('T')[0]}: ${totalHours}h`);
        }
    } catch (error) {
        console.error('[Close Previous Shifts] Lỗi:', error);
    }
};