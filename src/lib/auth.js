import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dbConnect from './mongodb';

const SECRET = process.env.JWT_SECRET || 'your-very-secret-key';

// Make sure all these functions are exported
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export async function createUser(email, hashedPassword) {
  await dbConnect();
  return User.create({ email, password: hashedPassword });
}

export async function findUserByEmail(email) {
  await dbConnect();
  return User.findOne({ email });
}

export async function findUserById(id) {
  await dbConnect();
  return User.findById(id);
}