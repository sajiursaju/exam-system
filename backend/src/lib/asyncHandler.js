// Wraps an async controller so any thrown error goes to the error middleware.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
