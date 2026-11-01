import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

function assertAuthConfigured() {
  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    const error = new Error('JWT_SECRET must contain at least 32 characters.');
    error.status = 503;
    error.code = 'AUTH_UNAVAILABLE';
    throw error;
  }
}

function createToken(userId) {
  assertAuthConfigured();
  return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn });
}

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function registerUser({ name, email, password }) {
  assertAuthConfigured();
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, passwordHash });
    return { user: publicUser(user), token: createToken(user._id) };
  } catch (error) {
    if (error?.code === 11000) {
      const conflict = new Error('An account with this email already exists.');
      conflict.status = 409;
      conflict.code = 'EMAIL_IN_USE';
      throw conflict;
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) {
    const error = new Error('Email or password is incorrect.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  return { user: publicUser(user), token: createToken(user._id) };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User account not found.');
    error.status = 401;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return publicUser(user);
}
