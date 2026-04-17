const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// GET /user/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    bio: req.user.bio,
    phone: req.user.phone,
    location: req.user.location,
    createdAt: req.user.createdAt,
  });
};

// PATCH /user/me
const updateMe = [
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio max 300 chars'),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, bio, phone, location, avatar } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (bio !== undefined) updates.bio = bio;
      if (phone !== undefined) updates.phone = phone;
      if (location !== undefined) updates.location = location;
      if (avatar !== undefined) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select('-__v -googleId');

      res.json(user);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { getMe, updateMe };
