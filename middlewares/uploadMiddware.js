const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// DO NOT DO: module.exports = { upload }; 
// DO THIS:
module.exports = upload;