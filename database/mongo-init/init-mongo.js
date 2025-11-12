// MongoDB initialization script
// This script runs when the MongoDB container first starts

db = db.getSiblingDB('Save2Serve');

// Create the users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'goodName', 'email', 'password', 'phone', 'dob', 'role'],
      properties: {
        fullName: {
          bsonType: 'string',
          description: 'Full name is required and must be a string'
        },
        goodName: {
          bsonType: 'string',
          description: 'Good name is required and must be a string'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email is required and must be a valid email address'
        },
        password: {
          bsonType: 'string',
          description: 'Password is required and must be a string'
        },
        phone: {
          bsonType: 'string',
          description: 'Phone number is required and must be a string'
        },
        dob: {
          bsonType: 'date',
          description: 'Date of birth is required and must be a date'
        },
        role: {
          enum: ['Seller', 'Buyer'],
          description: 'Role must be either Seller or Buyer'
        }
      }
    }
  }
});

// Create unique index on email field
db.users.createIndex({ email: 1 }, { unique: true });

print('✅ Save2Serve database initialized successfully!');
print('✅ Users collection created with validation rules');
print('✅ Unique index created on email field');
