const multer = require('multer')
const path = require('path')
const fs = require('fs')


const uploadpath = 'uploads/'

if (!fs.existsSync(uploadpath)) {
    fs.mkdirSync(uploadpath, { recursive: true })
}


const FileFilter = (req, file, cb) => {
    const fileType = /jpeg|jpg|png|webp|mp4|mkv|avi|mp3|pdf/;

    const extname = fileType.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileType.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        return cb(new Error('Only Image File are allowed'), false)
    }
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadpath)
    },
    filename: function (req, file, cb) {
        const uniqueNumber = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safename = path.basename(file.originalname.replace(/\s+/g, '-'))
        cb(null, uniqueNumber + '-' + safename)
    },
})



const fileSizeCheck = (req, file, cb) => {
    let maxSize;

    if (file.mimetype.startWith("image/")) {
        maxSize = 5 * 1024 * 1024
    } else if (file.mimetype.startWith("video/")) {
        maxSize = 50 * 1024 * 1024
    } else if (file.mimetype.startWith("application/pdf")) {
        maxSize = 10 * 1024 * 1024
    } else {
        return cb(new Error("Unsoperted File type"), false)
    }

    if (file.size > maxSize) {
        return cb(new Error("File Size too big"), false)
    }

    cb(null, true)
}


const uploads = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        fileFilter(req, file, (err, success) => {
            if (err) return cb(err, false);
            fileSizeCheck(req, file, cb)
        })
    },
    limits: { fileSize: 50 * 1024 * 1024 }
})




const singleFileUplaod = uploads.single('file');
const multipleFileUplaod = uploads.array('file', 10);



module.exports = { uploads, singleFileUplaod, multipleFileUplaod };