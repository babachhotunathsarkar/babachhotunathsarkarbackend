// backend/src/controllers/video.controller.js
import cloudinary from '../config/cloudinary.js';
import Video from '../models/video.modal.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Helper: safe cloudinary delete ──
const safeCloudinaryDelete = async (publicId, resourceType = 'video') => {
  if (!publicId || publicId.trim() === '') return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
};

// ── Upload single video ──
export const uploadVideo = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const result = await cloudinary.uploader.upload_large(req.file.path, {
      resource_type: 'video',
      folder: 'temple_videos',
      use_filename: true,
      unique_filename: true,
      chunk_size: 6000000,
    });

    const video = new Video({
      title:      title    || path.parse(req.file.originalname).name,
      category:   category || 'general',
      videoUrl:   result.secure_url,
      publicId:   result.public_id,
      format:     result.format,
      size:       result.bytes,
      duration:   result.duration  || 0,
      width:      result.width     || 0,
      height:     result.height    || 0,
      thumbnail:  result.secure_url.replace('/upload/', '/upload/so_0/').replace(`.${result.format}`, '.jpg'),
      uploadedBy: req.user?._id || null,
    });

    await video.save();
    fs.unlinkSync(req.file.path);

    res.status(201).json({ success: true, message: 'Video uploaded successfully', data: video });

  } catch (error) {
    console.error('Upload video error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Error uploading video', error: error.message });
  }
};

// ── Upload multiple videos ──
export const uploadMultipleVideos = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No video files provided' });
    }

    const uploadedVideos = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload_large(file.path, {
          resource_type: 'video',
          folder: 'temple_videos',
          use_filename: true,
          unique_filename: true,
          chunk_size: 6000000,
        });

        const video = new Video({
          title:      title    || path.parse(file.originalname).name,
          category:   category || 'general',
          videoUrl:   result.secure_url,
          publicId:   result.public_id,
          format:     result.format,
          size:       result.bytes,
          duration:   result.duration  || 0,
          width:      result.width     || 0,
          height:     result.height    || 0,
          thumbnail:  result.secure_url.replace('/upload/', '/upload/so_0/').replace(`.${result.format}`, '.jpg'),
          uploadedBy: req.user?._id || null,
        });

        await video.save();
        uploadedVideos.push(video);
        fs.unlinkSync(file.path);

      } catch (err) {
        console.error('Per video error:', err.message);
        errors.push({ file: file.originalname, error: err.message });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedVideos.length} videos uploaded successfully`,
      data: uploadedVideos,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Multiple video upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading videos', error: error.message });
  }
};

// ── Get all videos ──
export const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    let query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'name email');

    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        currentPage:  Number(page),
        totalPages:   Math.ceil(total / limit),
        totalItems:   total,
        itemsPerPage: Number(limit),
      },
    });

  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message });
  }
};

// ── Get video by ID ──
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching video', error: error.message });
  }
};

// ── Update video ──
export const updateVideo = async (req, res) => {
  try {
    const { title, category } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    if (title    && title.trim())    video.title    = title.trim();
    if (category && category.trim()) video.category = category.trim();

    await video.save();
    res.status(200).json({ success: true, message: 'Video updated successfully', data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating video', error: error.message });
  }
};

// ── Delete single video ──
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    await safeCloudinaryDelete(video.publicId, 'video');
    await video.deleteOne();

    res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ success: false, message: 'Error deleting video', error: error.message });
  }
};

// ── Bulk delete videos ──
export const bulkDeleteVideos = async (req, res) => {
  try {
    const { videoIds } = req.body;
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty video IDs' });
    }

    const videos = await Video.find({ _id: { $in: videoIds } });
    let deletedCount = 0;
    const errors = [];

    for (const video of videos) {
      try {
        await safeCloudinaryDelete(video.publicId, 'video');
        await video.deleteOne();
        deletedCount++;
      } catch (err) {
        errors.push({ id: video._id, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${deletedCount} videos deleted successfully`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting videos', error: error.message });
  }
};

// ── Get videos by category ──
export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    const videos = await Video.find({ category }).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message });
  }
};