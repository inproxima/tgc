require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN_REACT_APP, 
  process.env.CORS_ORIGIN_REACT_APP_SERVER,
  'http://localhost:3000', // Keep for local development
  'http://localhost:5003'  // Keep for local development, if this is another local client
].filter(Boolean); // Filter out undefined/null values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/casestudies';
console.log('Attempting to connect to MongoDB at: ' + mongoUri.replace(/(?<=:\/\/[^:]+:)[^@]+(?=@)/, '***'));

// Add options to match the recommended settings
const mongooseOptions = {
  // For Mongoose 6+, these options are no longer needed but including for completeness
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  // Add database name if not in connection string
  dbName: 'casestudies'
};

mongoose.connect(mongoUri, mongooseOptions)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Cannot connect to MongoDB Atlas. Check your connection string and make sure:');
    console.error('1. Your password is correct');
    console.error('2. Your IP address is whitelisted in Atlas');
    console.error('3. The Atlas cluster is running');
    process.exit(1); // Exit on connection failure to prevent trying to use an undefined GridFS
  });

// Mongoose schema for file metadata
const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  fileId: mongoose.Schema.Types.ObjectId,
});
const File = mongoose.model('File', fileSchema, 'files');

// Multer storage (memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GridFS for file storage
const { GridFSBucket } = require('mongodb');
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

// Add this before your upload endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'File upload server is running' });
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    // Generate our own filename and ID
    const fileId = new mongoose.Types.ObjectId();
    const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '-');
    
    // Create a promise to handle the GridFS upload
    const uploadFile = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(filename, {
          contentType: req.file.mimetype,
          metadata: { originalname: req.file.originalname },
          _id: fileId
        });
        
        // Handle upload completion
        uploadStream.on('finish', () => {
          resolve(fileId);
        });
        
        // Handle errors
        uploadStream.on('error', (err) => {
          reject(err);
        });
        
        // Write the file data to the stream
        uploadStream.end(req.file.buffer);
      });
    };
    
    // Wait for the file to be uploaded
    const uploadedId = await uploadFile();
    
    // Save metadata in files collection
    const fileDoc = new File({
      filename: filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      fileId: uploadedId
    });
    
    await fileDoc.save();
    console.log("File uploaded and metadata saved successfully");
    res.json({ 
      message: 'File uploaded successfully', 
      fileId: uploadedId,
      filename: filename
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`File upload backend running on port ${PORT}`);
}); 