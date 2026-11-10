class Inventory {
  constructor(id, productId, warehouseId, quantity, updatedAt) {
    this.id = id;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.updatedAt = updatedAt;
  }
}
module.exports = Inventory;