import { MenuCategory } from '../models/MenuCategory.js';
import menuCategoryCacheService from '../services/menuCategoryCacheService.js';

export const getAllMenuCategories = async (req, res) => {
    try {
        // Try to get from cache first
        const cachedData = await menuCategoryCacheService.get();
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        // If not in cache, fetch from database
        const categories = await MenuCategory.findAll({
            order: [
                ['id', 'ASC']
            ]
        });

        // Store in cache for future requests
        await menuCategoryCacheService.set(categories);

        res.status(200).json(categories);
    }
    catch (error) {
        console.error("Lỗi lấy danh mục thực đơn:", error);
        res.status(500).json({ message: 'GetAll Error', error: error.message });
    }
};

export const createMenuCategory = async (req, res) => {
    try {
        const { code, name, description } = req.body;
        const category = new MenuCategory({ code, name, description });
        await category.save();

        // Invalidate cache when new category is created
        await menuCategoryCacheService.invalidate();

        res.status(201).json({ message: 'Danh mục thực đơn đã được thêm!' });
    }
    catch (error) {
        console.error("Lỗi khi thêm danh mục thực đơn:", error);
        res.status(500).json({ message: 'Create Error', error: error.message });
    }
};

export const updateMenuCategory = async (req, res) => {
    try {
        const { code, name, description } = req.body;
        const [category] = await MenuCategory.update(
            { code, name, description },
            { where: { id: req.params.id }, 
            returning: true }
        );
        if (category === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục thực đơn' });
        }

        // Invalidate cache when category is updated
        await menuCategoryCacheService.invalidate();

        res.status(200).json({ message: 'Danh mục thực đơn đã được cập nhật!' });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật danh mục thực đơn:", error);
        res.status(500).json({ message: 'Update Error', error: error.message });
    }
};

export const deleteMenuCategory = async (req, res) => {
    try {
        const deletedCategory = await MenuCategory.destroy({ where: { id: req.params.id } });
        if (deletedCategory === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục thực đơn' });
        }

        // Invalidate cache when category is deleted
        await menuCategoryCacheService.invalidate();

        res.status(200).json({ message: 'Danh mục thực đơn đã được xóa!' });
    }
    catch (error) {
        console.error("Lỗi khi xóa danh mục thực đơn:", error);
        res.status(500).json({ message: 'Delete Error', error: error.message });
    }
};

