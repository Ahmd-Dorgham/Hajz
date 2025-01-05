export class ErrorClass extends Error {
  constructor(message, status = 500, data = null, location = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.location = location;
  }
}
