const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  uni: String,
  matricNo: String,
  ntuEmail: String,
  email: String,
  gender: String,
  tele: String,
  course: String,
  diet: String,
  size: String,
  night: Boolean,
});

const teamSchema = new mongoose.Schema({
  teamName: String,
  members: [memberSchema],
});

const participantSchema = new mongoose.Schema({
  teamName: { type: String, default: null },
  members: { type: [memberSchema], default: undefined },
  solo: { type: memberSchema, default: undefined },
});

const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);

module.exports = Participant;
