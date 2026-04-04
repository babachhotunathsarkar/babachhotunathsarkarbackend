// src/controllers/addressController.js
import asyncHandler from 'express-async-handler';
import Address from '../models/address.model.js';

// @desc  Get address info (public) — single document pattern
// @route GET /api/address
export const getAddress = asyncHandler(async (req, res) => {
  // isMain filter hata diya, ab ye simply pehla document return karega
  const address = await Address.findOne().sort({ createdAt: -1 }); 

  if (!address) {
    return res.status(404).json({ 
      success: false, 
      message: 'Address not found. Please add an address in the admin panel.' 
    });
  }
  
  res.status(200).json({ success: true, data: address });
});

// @desc  Get all addresses (admin)
// @route GET /api/admin/address
export const getAllAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find().sort({ isMain: -1, createdAt: -1 });
  res.status(200).json({ success: true, data: addresses });
});

// @desc  Create address
export const createAddress = asyncHandler(async (req, res) => {
  const {
    street, city, state, village, contactNumber, email,
    pincode, country, altPhone, website, mapLink
  } = req.body;
  console.log("req.body",req.body);
  if (!street || !city || !state || !village) {
    return res.status(400).json({ success: false, message: 'Street, City, State, and Village are required' });
  }

  const address = await Address.create({
    street,
    city,
    state,
    village,
    contactNumber,
    email,
    pincode,
    country: country || 'India',
    altPhone,
    website,
    mapLink
  });

  res.status(201).json({ success: true, message: 'Address created', data: address });
});


// @desc  Update address
// @route PUT /api/admin/address/:id
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) return res.status(404).json({ success: false, message: 'Not found' });

  const fields = [
    'street', 'city', 'state', 'village', 'contactNumber', 'email',
    'pincode', 'country', 'altPhone', 'website', 'mapLink'
  ];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      address[f] = req.body[f];
    }
  });

  // If setting as main, un-main others first
  if (req.body.isMain === true) {
    await Address.updateMany({ _id: { $ne: address._id } }, { isMain: false });
    address.isMain = true;
  } else if (req.body.isMain === false) {
    address.isMain = false;
  }

  await address.save();

  res.status(200).json({ success: true, message: 'Updated', data: address });
});

// @desc  Delete address
// @route DELETE /api/admin/address/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) return res.status(404).json({ success: false, message: 'Not found' });
  await address.deleteOne();
  res.status(200).json({ success: true, message: 'Deleted' });
});
