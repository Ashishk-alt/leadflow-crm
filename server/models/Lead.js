const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add the contact name'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add the company name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notes: {
      type: String,
      default: '',
    },
    estimatedValue: {
      type: Number,
      default: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign the lead to a BDA'],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', leadSchema);
