const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class User {
  static collection() {
    return getDB().collection('users');
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      return await this.collection().findOne({ email });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      return await this.collection().findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        email,
        password: hashedPassword,
        name,
        role,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.collection().insertOne(user);
      
      return {
        _id: result.insertedId,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('User with this email already exists');
      }
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Update user
  static async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date()
      };

      const result = await this.collection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { 
          returnDocument: 'after',
          projection: { password: 0 }
        }
      );

      return result.value;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email is already taken');
      }
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (admin only)
  static async findAll(limit = 50, skip = 0) {
    try {
      const cursor = this.collection().find(
        {},
        { projection: { password: 0 } }
      )
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

      return await cursor.toArray();
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  // Delete user (admin only)
  static async delete(id) {
    try {
      const result = await this.collection().findOneAndDelete(
        { _id: new ObjectId(id) },
        { projection: { _id: 1 } }
      );
      return result.value;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = User;