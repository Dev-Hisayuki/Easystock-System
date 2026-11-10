class StockAdjustment {
  constructor(id, productId, warehouseId, adjustedBy, qtyChange, reason, createdAt) {
    this.id = id;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.adjustedBy = adjustedBy;
    this.qtyChange = qtyChange;
    this.reason = reason;
    this.createdAt = createdAt;
  }
}
module.exports = StockAdjustment;