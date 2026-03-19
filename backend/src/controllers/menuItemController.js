import { MenuItem } from "../models/MenuItem.js";
import { MenuCategory } from "../models/MenuCategory.js";
import menuItemCacheService from "../services/menuItemCacheService.js";

export const getMenu = async (req, res) => {
    try {
        const { category } = req.query;

        // Nếu có category filter, query trực tiếp không dùng cache
        if (category) {
            const items = await MenuItem.findAll({
                where: { active: true, '$category.code$': category },
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

            return res.json(result);
        }

        // Không có category filter - sử dụng cache
        const cachedData = await menuItemCacheService.get();
        if (cachedData) {
            return res.json(cachedData);
        }

        // Lấy tất cả menu items và cache
        const items = await MenuItem.findAll({
            where: { active: true },
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

        // Store in cache
        await menuItemCacheService.set(result);

        res.json(result);
    } catch (error) {
        console.error("Lỗi lấy thực đơn theo cửa hàng:", error);
        res.status(500).json({ message: 'GetMenuByStore Error', error: error.message });
    }
};
