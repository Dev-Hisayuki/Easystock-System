class StockTransfer {
  constructor(id, sourceWarehouseId, destWarehouseId, status, requestedBy, createdAt) {
    this.id = id;
    this.sourceWarehouseId = sourceWarehouseId;
    this.destWarehouseId = destWarehouseId;
    this.status = status;
    this.requestedBy = requestedBy;
    this.createdAt = createdAt;
  }
}
module.exports = StockTransfer;