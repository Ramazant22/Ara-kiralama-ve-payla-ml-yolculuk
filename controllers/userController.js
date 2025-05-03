const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// Kendi profilini görüntüleme
exports.getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

// Profil güncelleme
exports.updateMe = async (req, res) => {
  try {
    // Şifre güncelleme kontrolü
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Şifre güncellemek için /update-password rotasını kullanın'
      });
    }

    // Güncellenebilir alanlar
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'profilePicture'];
    const filteredBody = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcı hesabını silme
exports.deleteMe = async (req, res) => {
  try {
    // Hesabı aktif olmayan duruma getir
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Şifre güncelleme
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı şifresiyle birlikte al
    const user = await User.findById(req.user._id).select('+password');

    // Mevcut şifre kontrolü
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Mevcut şifreniz yanlış'
      });
    }

    // Şifre güncelleme
    user.password = newPassword;
    await user.save();

    // JWT token oluşturma
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Tüm kullanıcıları getirme (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Belirli bir kullanıcıyı getirme (Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcı güncelleme (Admin)
exports.updateUser = async (req, res) => {
  try {
    // Şifre güncelleme kontrolü
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bu rota şifre güncellemek için kullanılamaz'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Kullanıcı silme (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 