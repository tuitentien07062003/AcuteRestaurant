import { Inventory } from "../models/Inventory.js";
import { Op } from "sequelize";
import inventoryCacheService from "../services/inventoryCacheService.js";

export const getAllInventories = async (req, res) => {
  try {
    const { category, name } = req.query;
    
    let whereClause = {};
    if (category) whereClause.category = category;
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };

    const cacheKey = `inventory:${category || 'all'}:${name || 'all'}`;
    // DISABLED CACHE: let inventories = await inventoryCacheService.get(cacheKey);

    const inventories = await Inventory.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    // DISABLED CACHE: await inventoryCacheService.set(cacheKey, inventories);

    res.json(inventories);
  } catch (error) {
    console.error("Lỗi lấy danh sách kho:", error);
    res.status(500).json({ message: 'Get All Inventory Error', error: error.message });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    !inventory
      ? res.status(404).json({ message: "Không tìm thấy vật tư" })
      : res.json(inventory);
  } catch (error) {
    console.error("Lỗi lấy vật tư:", error);
    res.status(500).json({ message: 'Get Inventory ById Error', error: error.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { name, unit, category, min_stock } = req.body;

    if (!name || !unit) {
      return res.status(400).json({ message: "Thiếu tên hoặc đơn vị" });
    }

    const inventory = await Inventory.create({
      name,
      unit,
      category: category || null,
      min_stock: min_stock || 0
    });

    // DISABLED CACHE: await inventoryCacheService.invalidate();

    res.status(201).json({ message: 'Vật tư đã được thêm!', inventory });
  } catch (error) {
    console.error("Lỗi tạo vật tư:", error);
    res.status(500).json({ message: 'Create Inventory Error', error: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const [updated] = await Inventory.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    if (updated === 0) {
      return res.status(404).json({ message: "Không tìm thấy vật tư" });
    }
    // DISABLED CACHE: await inventoryCacheService.invalidate();
    res.json({ message: "Vật tư đã được cập nhật!" });
  } catch (error) {
    console.error("Lỗi cập nhật vật tư:", error);
    res.status(500).json({ message: 'Update Inventory Error', error: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const deleted = await Inventory.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Không tìm thấy vật tư" });
    }
    // DISABLED CACHE: await inventoryCacheService.invalidate();
    res.json({ message: "Vật tư đã được xóa!" });
  } catch (error) {
    console.error("Lỗi xóa vật tư:", error);
    res.status(500).json({ message: 'Delete Inventory Error', error: error.message });
  }
};