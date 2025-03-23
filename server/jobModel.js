const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  jobType: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
  pay: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);