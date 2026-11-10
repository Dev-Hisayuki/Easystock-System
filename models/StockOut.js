class StockOut {
  constructor(id, warehouseId, recipient, issuedBy, createdAt) {
    this.id = id;
    this.warehouseId = warehouseId;
    this.recipient = recipient;
    this.issuedBy = issuedBy;
    this.createdAt = createdAt;
  }
}
module.exports = StockOut;