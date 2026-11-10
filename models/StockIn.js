class StockIn {
  constructor(id, supplierId, warehouseId, receivedBy, createdAt) {
    this.id = id;
    this.supplierId = supplierId;
    this.warehouseId = warehouseId;
    this.receivedBy = receivedBy;
    this.createdAt = createdAt;
  }
}
module.exports = StockIn;