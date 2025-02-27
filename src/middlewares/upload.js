const { S3Client, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
require('dotenv').config();

// 🔹 Validación de variables de entorno
const requiredEnvVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET"];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`❌ Error: Falta la variable de entorno ${envVar} en el archivo .env`);
    }
});

// 🔹 Configuración del cliente S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// 🔹 Verificar conexión con el bucket S3
(async () => {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
        console.log(`✅ Conexión exitosa con el bucket ${process.env.AWS_S3_BUCKET}`);
    } catch (error) {
        console.error(`❌ Error: No se pudo acceder al bucket ${process.env.AWS_S3_BUCKET}. Verifica los permisos en AWS.`);
        console.error("Detalles:", error.message);
        throw new Error(`❌ Error: Acceso denegado al bucket ${process.env.AWS_S3_BUCKET}`);
    }
})();

// 🔹 Configuración de Multer para almacenamiento en S3
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'private', // Cambia a 'public-read' si necesitas acceso público
        contentType: multerS3.AUTO_CONTENT_TYPE, // Detecta automáticamente el tipo de archivo
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            // 🔹 Generar un nombre de archivo único con un hash seguro
            const uniqueSuffix = crypto.randomBytes(8).toString('hex');
            const sanitizedFileName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
            cb(null, `uploads/${Date.now()}-${uniqueSuffix}-${sanitizedFileName}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño: 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Solo se aceptan imágenes JPEG, JPG y PNG"), false);
        }
        cb(null, true);
    }
});

// 🔹 Middleware para manejar errores de Multer
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        let message;
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                message = "❌ Error: El archivo excede el límite de 5MB.";
                break;
            case "LIMIT_UNEXPECTED_FILE":
                message = "❌ Error: Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, JPG y PNG.";
                break;
            default:
                message = "❌ Error al subir el archivo.";
        }
        return res.status(400).json({ message });
    }
    next(err);
};

// 🔹 Exportar configuración de subida y middleware de errores
module.exports = { upload, handleUploadErrors };
