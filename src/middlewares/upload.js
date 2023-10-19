const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    // console.log(file.originalname);
    const splitOgName = file.originalname.split(".");
    const generatedName = Date.now() + Math.round(Math.random() * 10000);
    cb(null, generatedName + "." + splitOgName[splitOgName.length - 1]);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
