import { Store } from "../models/Store.js";

export const getStoreById = async (req, res) => {
    try {
        const store = await Store.findAll();
        !store
            ? res.status(404).json({ message: "Không tìm thấy cửa hàng" })
            : res.status(200).json(store);
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin cửa hàng:", error);
        res.status(500).json({ message: 'GetStoreById Error', error: error.message });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { address, city, hotline, tier } = req.body;
        const updatedStore = await Store.findByIdAndUpdate(
            req.params.id,
            {
                address,
                city,
                hotline,
                tier
            },
            { new: true }
        );
        !updatedStore
            ? res.status(404).json({ message: "Không tìm thấy cửa hàng" })
            : res.status(200).json({ message: 'Thông tin cửa hàng đã được cập nhật!' });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật thông tin cửa hàng:", error);
        res.status(500).json({ message: 'UpdateStore Error', error: error.message });
    }
};