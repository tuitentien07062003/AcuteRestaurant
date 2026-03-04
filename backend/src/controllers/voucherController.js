import { Voucher } from "../models/Voucher.js";

export const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.findAll();
        res.status(200).json(vouchers);
    }
    catch (error) {
        console.error("Lỗi lấy voucher:", error);
        res.status(500).json({ message: 'GetAll Error', error: error.message });
    }
};

export const getVoucherById = async (req, res) => {
    try {
        const voucher = await Voucher.findByPk(req.params.id);
        !voucher
            ? res.status(404).json({ message: "Không tìm thấy voucher" })
            : res.status(200).json(voucher);
    }
    catch (error) {
        console.error("Lỗi lấy voucher:", error);
        res.status(500).json({ message: 'GetById Error', error: error.message });
    }
};

export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher.findOne({ where: { code, active: true } });
        !voucher
            ? res.status(404).json({ message: "Không tìm thấy voucher" })
            : res.status(200).json(voucher);
    }
    catch (error) {
        console.error("Lỗi lấy voucher:", error);
        res.status(500).json({ message: 'GetBySearch Error', error: error.message });
    }
};

export const createVoucher = async (req, res) => {
    try {
        const { code, discount_value, discount_percent, start_date, end_date } = req.body;
        const voucher = new Voucher({ code, discount_value, discount_percent, start_date, end_date });
        const savedVoucher = await voucher.save();
        res.status(201).json({ message: 'Voucher đã được thêm!' });
    }
    catch (error) {
        console.error("Lỗi khi thêm voucher:", error);
        res.status(500).json({ message: 'Create Error', error: error.message });
    }
};

export const updateVoucher = async (req, res) => {
    try {
        const { code, discount_value, discount_percent, start_date, end_date } = req.body;
        const [updatedVoucher] = await Voucher.update(
            { 
                code, 
                discount_value, 
                discount_percent, 
                start_date, 
                end_date
            },
            { where: { id: req.params.id },
            returning: true }
        );

        if(updatedVoucher === 0) {
            return res.status(404).json({ message: "Không tìm thấy voucher"});
        }
        res.status(200).json({ message: "Thông tin voucher đã được cập nhật!" });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật voucher: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

export const activeVoucher = async (req, res) => {
    try {
        const { active } = req.body;
        const [activedVoucher] = await Voucher.update(
            { active },
            { where: { id: req.params.id } }
        );

        if(activedVoucher === 0) {
            return res.status(404).json({ message: "Không tìm thấy voucher"});
        }
        return res.status(200).json({ message: "Đã cập nhật trạng thái voucher: " + (active ? "Kích hoạt" : "Vô hiệu hóa") });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật voucher: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

export const updateDateVoucher = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const [dateVoucher] = await Voucher.update(
            { start_date, end_date },
            { where: { id: req.params.id } }
        );
        if(dateVoucher === 0) {
            return res.status(404).json({ message: "Không tìm thấy voucher"});
        }
        res.status(200).json({ message: "Ngày voucher đã được cập nhật!" });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật voucher: ", error);
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

export const deleteVoucher = async (req, res) => {
    try {
        const deletedVoucher = await Voucher.destroy({ where: { id: req.params.id } });
        if(deletedVoucher === 0) {
            return res.status(404).json({ message: "Không tìm thấy voucher"});
        }
        res.status(200).json({ message: "Voucher đã được xóa!" });
    }
    catch (error) {
        console.error("Lỗi khi xóa voucher: ", error);
        res.status(500).json({ message: "Delete Error", error: error.message });
    }
};