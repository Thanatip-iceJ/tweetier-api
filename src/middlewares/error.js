module.exports = (err, req, res, next) => {
  res(err.statusCode || 500).json({ message: err.message });
};
