class PurchaseOrder {
  constructor(id, supplierId, totalAmount, status, createdAt) {
    this.id = id;
    this.supplierId = supplierId;
    this.totalAmount = totalAmount;
    this.status = status;
    this.createdAt = createdAt;
  }
}
module.exports = PurchaseOrder;