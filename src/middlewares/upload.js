const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config(); // Asegura que las variables de entorno sean cargadas

// Validar que las variables de entorno necesarias estén definidas
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
    throw new Error("❌ Error: Faltan variables de entorno en el archivo .env");
}

// Configuración de AWS S3
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Configuración de Multer con S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read', // Permite acceso público a los archivos subidos
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `uploads/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite de tamaño: 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("❌ Error: Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, JPG y PNG."));
        }
    }
});

// Exportar configuración de subida
module.exports = upload;
