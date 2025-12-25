import { user } from "../models/user.js";
import express from "express";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodeMailer.js";

export const register = async (req, res) => {
  const { name, email, password, avatar, role } = req.body
  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Detail' })
  }
  if (role == 'ADMIN') {
    return res.json({ success: false, message: 'sorry you cant be an admin' })
  }
  try {
    const existedUser = await user.findOne({ email })
    if (existedUser) {
      return res.json({ success: false, message: 'Email already existes' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new user({
      email,
      name,
      password: hashedPassword,
      role
    })
    await newUser.save()

    const token = jwt.sign({ id: newUser._id }, process.env.HASH_KEY, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    //sending welcome email

    const mailOption = ({
      from: process.env.EMAIL,
      to: email,
      subject: 'Welcome to Digital Equb',
      text: `Welcome to Digital Equb. Hello ${name}, Your account is created with email id: ${email}`
    })
    await transporter.sendMail(mailOption)

    res.json({ success: true })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.json({ success: false, message: 'Missing Detail' })
  }
  try {
    const User = await user.findOne({ email })
    if (!User) {
      return res.json({ success: false, message: 'User not found' })
    }
    const isMatch = await bcrypt.compare(password, User.password)
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: User._id }, process.env.HASH_KEY, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    const userResponse = {
      _id: User._id,
      name: User.name,
      email: User.email,
      role: User.role,
      IsAccVerified: User.IsAccVerified,
      walletAddress: User.walletAddress,
      isWalletLinked: User.isWalletLinked
    };
    res.json({ success: true, user: userResponse })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const sendVerifyOTP = async (req, res) => {
  const { userId } = req.body
  try {
    const User = await user.findById(userId)
    if (User.IsAccVerified) {
      return res.json({ success: false, message: 'Account already verified' })
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000))
    User.verifyOTP = OTP
    User.OTPExpireAt = Date.now() + 24 * 60 * 60 * 1000
    await User.save()
    const mailOption = ({
      from: process.env.EMAIL,
      to: User.email,
      subject: 'Account verification OTP',
      text: `Your OTP is ${OTP}, verify your account with this OTP`
    })
    await transporter.sendMail(mailOption)
    res.json({ success: true, message: 'Verification OTP sent' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const verifyOTP = async (req, res) => {
  const { otp, userId } = req.body
  if (!userId || !otp) {
    return res.json({ success: false, message: 'Missing details' })
  }
  try {
    const User = await user.findById(userId)
    if (!User) {
      return res.json({ success: false, message: 'User not found' })
    }
    if (User.verifyOTP === '' || User.verifyOTP !== otp) {
      return res.json({ success: false, message: 'Verification faild' })
    }
    if (User.OTPExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' })
    }
    User.IsAccVerified = true;
    User.verifyOTP = '';
    User.OTPExpireAt = 0;
    await User.save()
    res.json({ success: true, message: 'Verification OTP verified successfully' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const isAuth = async (req, res) => {
  try {
    return res.json({ success: true })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const sendResetOTP = async (req, res) => {
  const { email } = req.body
  if (!email) {
    res.json({ success: false, message: 'Missing details' })
  }
  try {
    const User = await user.findOne({ email })
    if (!User) {
      return res.json({ success: false, message: 'User not found' })
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000))
    User.ResetOTP = OTP
    User.ResetOTPExpireAt = Date.now() + 15 * 60 * 1000
    await User.save()
    const mailOption = ({
      from: process.env.EMAIL,
      to: User.email,
      subject: 'Password reset OTP',
      text: `Your OTP for reseting your password is ${OTP}. Use this OTP to proceed with reseting your password.`
    })
    await transporter.sendMail(mailOption)
    res.json({ success: true, message: 'OTP sent to your email' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    res.json({ success: false, message: 'Missing details' })
  }
  try {
    const User = await user.findOne({ email })
    if (!User) {
      return res.json({ success: false, message: 'User not found' })
    }
    if (User.ResetOTP == '' || User.ResetOTP !== otp) {
      return res.json({ success: false, message: 'Invalid OTP number' })
    }
    if (User.ResetOTPExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP is Expired' })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    User.password = hashedPassword;
    User.ResetOTP = '';
    User.ResetOTPExpireAt = 0;
    await User.save();
    return res.json({ success: true, message: 'Password has been reseted successfully' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body
    const User = await user.findById(userId)
    if (!User) {
      return res.json({ success: false, message: 'User not found' })
    }
    return res.json({
      success: true,
      userData: {
        name: User.name,
        email: User.email,
        IsAccVerified: User.IsAccVerified,
        walletAddress: User.walletAddress,
        isWalletLinked: User.isWalletLinked,
        phoneNumber: User.phoneNumber,
        avatar: User.avatar,
        activeEqubCount: User.activeEqubCount,
        totalWinnings: User.totalWinnings,
        role: User.role
      }
    })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const updateProfile = async (req, res) => {
  const { userId, name, avatar, phoneNumber } = req.body;
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    await user.findByIdAndUpdate(userId, updateData);
    return res.json({ success: true })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// Link wallet address to user account
export const linkWallet = async (req, res) => {
  const { userId, walletAddress } = req.body;
  
  if (!userId || !walletAddress) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    // Check if wallet is already linked to another account
    const existingWallet = await user.findOne({ walletAddress, _id: { $ne: userId } });
    if (existingWallet) {
      return res.json({ success: false, message: 'Wallet already linked to another account' });
    }

    const User = await user.findById(userId);
    if (!User) {
      return res.json({ success: false, message: 'User not found' });
    }

    User.walletAddress = walletAddress.toLowerCase();
    User.isWalletLinked = true;
    await User.save();

    return res.json({ 
      success: true, 
      message: 'Wallet linked successfully',
      walletAddress: User.walletAddress
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

// Unlink wallet from user account
export const unlinkWallet = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'Missing user ID' });
  }

  try {
    const User = await user.findById(userId);
    if (!User) {
      return res.json({ success: false, message: 'User not found' });
    }

    User.walletAddress = '';
    User.isWalletLinked = false;
    await User.save();

    return res.json({ success: true, message: 'Wallet unlinked successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}