const multer = require('multer');

// We use memoryStorage so we can pass the "buffer" to your function
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;