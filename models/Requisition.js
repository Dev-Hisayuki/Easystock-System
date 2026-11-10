class Requisition {
  constructor(id, departmentId, requestedBy, status, createdAt) {
    this.id = id;
    this.departmentId = departmentId;
    this.requestedBy = requestedBy;
    this.status = status;
    this.createdAt = createdAt;
  }
}
module.exports = Requisition;