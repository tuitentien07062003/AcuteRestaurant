'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Thêm khóa ngoại cho store_id
    await queryInterface.addConstraint('payment_request', {
      fields: ['store_id'],
      type: 'foreign key',
      name: 'fk_payment_request_store', // Tên ràng buộc trong DB
      references: {
        table: 'store', // Tên bảng tham chiếu
        field: 'id'     // Tên cột tham chiếu
      },
      onDelete: 'CASCADE', // Tùy chọn: Xóa store thì xóa luôn phiếu thanh toán
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Hủy các ràng buộc khi rollback
    await queryInterface.removeConstraint('payment_request', 'fk_payment_request_store');
  }
};