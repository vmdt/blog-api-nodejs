const multer = require('multer');

const  {storage} = require('../config/cloudinary');
const upload = multer({storage});

const uploadSingleFile = filename => upload.single(filename);
const uploadMultipleFiles = files => upload.array(files);

module.exports = {
    uploadSingleFile,
    uploadMultipleFiles
}
