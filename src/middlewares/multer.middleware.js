import multer from "multer";

// Set up storage: where and how files are saved
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'), // upload dir
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (['image/jpeg','image/png','image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});