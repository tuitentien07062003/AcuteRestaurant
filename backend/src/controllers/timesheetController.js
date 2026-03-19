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
