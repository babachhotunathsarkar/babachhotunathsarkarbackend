// D:\New Project of Temple\backend\src\controllers\image.controller.js
import cloudinary from '../config/cloudinary.js';
import Image from '../models/image.modal.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'temple_images',
      use_filename: true,
      unique_filename: true
    });

    // Create image record in database
    const image = new Image({
      title: title || path.parse(req.file.originalname).name,
      description: description || '',
      category: category || 'general',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      uploadedBy: req.user?._id || null
    });

    await image.save();

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: image
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
  try {
    const { title, category } = req.body;     // ← ye dekho
  console.log('Body received:', req.body);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

     console.log('Files received:', req.files); 
    const uploadedImages = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'temple_images',
          use_filename: true,
          unique_filename: true
        });

        // Create image record
        const image = new Image({
          title: title || path.parse(file.originalname).name,
          category: category || 'general',
          imageUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height,
          uploadedBy: req.user._id
        });

        await image.save();
        uploadedImages.push(image);

        // Delete temporary file
        fs.unlinkSync(file.path);

      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Get all images
export const getAllImages = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'name email');
    
    const total = await Image.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: images,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
};

// Get single image
export const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).populate('uploadedBy', 'name email');
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: image
    });
    
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching image',
      error: error.message
    });
  }
};

// Update image
export const updateImage = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Update fields
    if (title) image.title = title;
    if (description) image.description = description;
    if (category) image.category = category;
    
    await image.save();
    
    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: image
    });
    
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating image',
      error: error.message
    });
  }
};
const safeCloudinaryDelete = async (publicId) => {
  if (!publicId || publicId.trim() === '') return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
};
export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
 
    await safeCloudinaryDelete(image.publicId);
    await image.deleteOne();
 
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
 
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
  }
};
 
// ── Bulk delete images ──
export const bulkDeleteImages = async (req, res) => {
  try {
    const { imageIds } = req.body;
 
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty image IDs' });
    }
 
    const images = await Image.find({ _id: { $in: imageIds } });
    let deletedCount = 0;
    const errors = [];
 
    for (const image of images) {
      try {
        await safeCloudinaryDelete(image.publicId);
        await image.deleteOne();
        deletedCount++;
      } catch (err) {
        console.error('Bulk delete per image error:', err.message);
        errors.push({ id: image._id, error: err.message });
      }
    }
 
    res.status(200).json({
      success: true,
      message: `${deletedCount} images deleted successfully`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
 
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting images', error: error.message });
  }
};

// Get images by category
export const getImagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const images = await Image.find({ category })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: images
    });
    
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
};