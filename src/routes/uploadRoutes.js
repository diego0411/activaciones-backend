const express = require('express');
const { S3Client, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config(); // Cargar variables de entorno

const router = express.Router();

// 🔹 Verificar que las variables de entorno estén definidas
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET || AWS_S3_BUCKET.trim() === '') {
    console.error("❌ Error: Faltan variables de entorno para configurar AWS S3. Revisa el archivo .env.");
    throw new Error("❌ Error: Configuración de AWS S3 incompleta. Asegúrate de definir todas las variables en .env.");
}

// 🔹 Configuración del cliente S3 usando el nuevo SDK
const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});

// 🔹 Verificar acceso al bucket antes de continuar
(async () => {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: AWS_S3_BUCKET }));
        console.log(`✅ Conexión exitosa con el bucket ${AWS_S3_BUCKET}`);
    } catch (error) {
        console.error(`❌ Error: No se pudo acceder al bucket ${AWS_S3_BUCKET}. Verifica los permisos en AWS.`);
        console.error("Detalles:", error.message);
        throw new Error(`❌ Error: Acceso denegado al bucket ${AWS_S3_BUCKET}`);
    }
})();

// 🔹 Configuración de Multer para almacenamiento en S3
const upload = multer({
    storage: multerS3({
        s3,
        bucket: AWS_S3_BUCKET,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE, // Detecta automáticamente el tipo de archivo
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const sanitizedFileName = file.originalname
                .replace(/\s+/g, '_') // Reemplaza espacios por "_"
                .replace(/[^a-zA-Z0-9_.-]/g, ''); // Elimina caracteres especiales
            cb(null, `uploads/${Date.now()}-${sanitizedFileName}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("❌ Error: Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, JPG y PNG."));
        }
    }
});

// 🔹 Ruta para subir imágenes
router.post('/upload', upload.array('photos', 4), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "❌ No se han subido archivos." });
        }

        const fileUrls = req.files.map(file => file.location); // URL públicas de los archivos

        res.status(200).json({
            message: "✅ Archivos subidos con éxito.",
            files: fileUrls
        });

    } catch (error) {
        console.error("❌ Error al subir archivos:", error);
        res.status(500).json({ message: "Error interno al subir archivos." });
    }
});

module.exports = router;
