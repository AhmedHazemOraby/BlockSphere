const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Application', applicationSchema);  