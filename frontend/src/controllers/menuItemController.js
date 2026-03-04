import { MenuItem } from "../models/MenuItem.js";
import { MenuCategory } from "../models/MenuCategory.js";

export const getMenu = async (req, res) => {
    try {
        const { category } = req.query;

        const where = { active: true };
        if (category) where['$category.code$'] = category;

        const items = await MenuItem.findAll({
            where,
            include: [{
                model: MenuCategory,
                as: "category",
                attributes: ["id", "code", "name"]
            }],
            attributes: ["id", "name", "price", "image_url", "active"]
        });

        const result = items.map(i => {
            const isSpagetti = i.category && i.category.code === "SPAGETTI";

            return {
                ...i.dataValues,
                image_url: `${process.env.IMG_URL1}${i.image_url}${isSpagetti ? ".jpg" : ".webp"}`
            };
            });


        res.json(result);
    } catch (error) {
        console.error("Lỗi lấy thực đơn theo cửa hàng:", error);
        res.status(500).json({ message: 'GetMenuByStore Error', error: error.message });
    }
};
