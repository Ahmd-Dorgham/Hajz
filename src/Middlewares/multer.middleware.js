import multer from "multer";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { extensions } from "../Utils/file-extensions.utils.js";

//upload from my device to the local
export const multerMiddleware = ({ filePath = "general", allowedExtensions = extensions.Images }) => {
  // disk storage engine
  // memory storage engine
  const destinationPath = path.resolve(`src/uploads/${filePath}`);
  // check if the folder exists
  if (!fs.existsSync(destinationPath)) {
    // create the folder
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    // destination
    destination: (req, file, cb) => {
      cb(null, destinationPath);
    },
    // filename
    filename: (req, file, cb) => {
      // 2024-12-12
      const now = DateTime.now().toFormat("yyyy-MM-dd");
      // generate a unique string
      const uniqueString = nanoid(4);
      // generate a unique file name
      const uniqueFileName = `${now}_${uniqueString}_${file.originalname}`;
      cb(null, uniqueFileName);
    },
  });

  // fileFilter
  const fileFilter = (req, file, cb) => {
    console.log(file);
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(
      new ErrorClass(
        `Invalid file type, only ${allowedExtensions} images are allowed`,
        400,
        `Invalid file type, only ${allowedExtensions} images are allowed`
      ),
      false
    );
  };

  return multer({ fileFilter, storage });
};

//upload from my device in order to know the path
export const multerHost = ({ allowedExtensions = extensions.Images }) => {
  const storage = multer.diskStorage({});

  // fileFilter
  const fileFilter = (req, file, cb) => {
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(
      new ErrorClass(
        `Invalid file type, only ${allowedExtensions} images are allowed`,
        400,
        `Invalid file type, only ${allowedExtensions} images are allowed`
      ),
      false
    );
  };

  return multer({ fileFilter, storage });
};

//for restaurant project
export const optionalUpload = (req, res, next) => {
  // Run multerHost single upload middleware
  multerHost({ allowedExtensions: ["image/jpeg", "image/png", "image/jpg"] }).single("image")(req, res, (err) => {
    if (err) {
      return next(err); // Pass multer errors to error handler
    }
    next(); // Continue if no file was uploaded
  });
};
