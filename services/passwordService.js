const bcrypt = require('bcryptjs');

/**
 * Hash plaintext password using bcrypt.
 * @param {string} password 
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plaintext password with hashed password.
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>} True if match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
