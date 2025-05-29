const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload dizinlerini oluştur
const uploadDirs = [
    'uploads/',
    'uploads/avatars/',
    'uploads/vehicles/',
    'uploads/documents/',
    'uploads/temp/'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/avatars/';
        } else if (file.fieldname === 'vehicleImages') {
            uploadPath = 'uploads/vehicles/';
        } else if (file.fieldname === 'documents') {
            uploadPath = 'uploads/documents/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Dosya adını benzersiz yap
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // İzin verilen dosya türleri
    const allowedTypes = {
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    };

    if (file.fieldname === 'avatar' || file.fieldname === 'vehicleImages') {
        if (allowedTypes.image.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP)'), false);
        }
    } else if (file.fieldname === 'documents') {
        if (allowedTypes.document.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece PDF ve resim dosyaları yüklenebilir'), false);
        }
    } else {
        cb(new Error('Geçersiz dosya alanı'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maksimum 10 dosya
    }
});

// Avatar upload middleware
const uploadAvatar = upload.single('avatar');

// Vehicle images upload middleware (multiple files)
const uploadVehicleImages = upload.array('vehicleImages', 10);

// Document upload middleware
const uploadDocuments = upload.fields([
    { name: 'registration', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 }
]);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Çok fazla dosya. Maksimum 10 dosya yüklenebilir.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Beklenmeyen dosya alanı.'
            });
        }
    }
    
    if (error.message) {
        return res.status(400).json({
            message: error.message
        });
    }
    
    next(error);
};

// Dosya silme utility function
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Dosya silme hatası:', error);
        return false;
    }
};

// Multiple files delete utility
const deleteFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) {
        filePaths = [filePaths];
    }
    
    filePaths.forEach(filePath => {
        if (filePath) {
            deleteFile(filePath);
        }
    });
};

module.exports = {
    uploadAvatar,
    uploadVehicleImages,
    uploadDocuments,
    handleUploadError,
    deleteFile,
    deleteFiles
}; 