import { Employee } from "../models/Employee.js";
import { Timesheet } from "../models/Timesheet.js";
import { Op } from "sequelize";

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
        const {internal_id} = req.body;

        const employee =  await Employee.findOne({where:{internal_id}});

        if(!employee){
            return res.status(404).json({message:"Nhân viên không tồn tại"});
        }

        // Trước khi thực hiện chấm công cho ngày hôm nay, kiểm tra và đóng các ca mở của các ngày trước
        await closePreviousOpenShifts(employee.id);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const startYesterday = new Date(yesterday);
        startYesterday.setHours(0,0,0,0);

        const endYesterday = new Date(yesterday);
        endYesterday.setHours(end_hour, end_minute, 59, 999);

        const openYesterdayShift = await Timesheet.findOne({
            where:{
                employee_id: employee.id,
                check_out: null,
                work_day: {
                    [Op.between]: [startYesterday, endYesterday]
                }
            }
        });

        if (openYesterdayShift) {
            const autoCheckOutTime = new Date(openYesterdayShift.work_day);
            autoCheckOutTime.setHours(end_hour, end_minute, 0, 0);

            const totalHours = ((autoCheckOutTime - new Date(openYesterdayShift.check_in)) / (1000 * 60 * 60)).toFixed(2);
            await openYesterdayShift.update({
                check_out: autoCheckOutTime,
                total_hours: totalHours
            });
        }

        const startToday = new Date();
        startToday.setHours(0,0,0,0);

        const endToday = new Date();
        endToday.setHours(end_hour, end_minute, 59, 999);

        let todayShift = await Timesheet.findOne({
            where:{
                employee_id: employee.id,
                work_day: {
                    [Op.between]: [startToday, endToday]
                }
            }
        });

        if (!todayShift) {
            // Check-in
            todayShift = await Timesheet.create({
                employee_id: employee.id,
                work_day: new Date(),
                check_in: new Date(),
                check_out: null,
            });

            return res.status(200).json({message:"Check-in thành công", type:"CHECK_IN", time: todayShift.check_in});
        }

        // Check-out
        if (!todayShift.check_out) {
            const checkOut = new Date();
            const totalHours = ((checkOut - new Date(todayShift.check_in)) / (1000 * 60 * 60)).toFixed(2);

            await todayShift.update({
                check_out: checkOut,
                total_hours: totalHours
            });

            return res.status(200).json({message:"Check-out thành công", type:"CHECK_OUT", total_hours: totalHours});
        }

        return res.status(400).json({message:"Ca làm việc hôm nay đã hoàn tất"});
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:"Lỗi server"});
    }
};

// Hàm đóng các ca mở của các ngày trước
const closePreviousOpenShifts = async (employeeId) => {
    try {
        const today = new Date();
        const startToday = new Date(today);
        startToday.setHours(0, 0, 0, 0);

        // Tìm tất cả ca mở trước ngày hôm nay
        const openShifts = await Timesheet.findAll({
            where: {
                employee_id: employeeId,
                check_out: null,
                work_day: {
                    [Op.lt]: startToday
                }
            }
        });

        if (openShifts.length === 0) {
            return;
        }

        console.log(`[Close Previous Shifts] Tìm thấy ${openShifts.length} ca mở trước ngày hôm nay cho nhân viên ${employeeId}`);

        // Đóng tất cả ca mở vào lúc 23:59:59 của ngày đó
        for (const shift of openShifts) {
            const closeTime = new Date(shift.work_day);
            closeTime.setHours(23, 59, 59, 999);

            const totalHours = ((closeTime - new Date(shift.check_in)) / (1000 * 60 * 60)).toFixed(2);

            await shift.update({
                check_out: closeTime,
                total_hours: totalHours
            });

            console.log(`[Close Previous Shifts] Đã đóng ca ngày ${shift.work_day.toISOString().split('T')[0]}: ${totalHours}h`);
        }

        console.log(`[Close Previous Shifts] Hoàn thành đóng ${openShifts.length} ca mở`);
    } catch (error) {
        console.error('[Close Previous Shifts] Lỗi:', error);
    }
};
