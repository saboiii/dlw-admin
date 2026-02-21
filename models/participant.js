import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participantType: {
    type: String,
    enum: ["uni", "preuni"],
    default: undefined,
  },
  uni: {
    type: String,
    required: function () {
      return (this.participantType || "uni") === "uni";
    },
  },
  institutionName: {
    type: String,
    required: function () {
      return (this.participantType || "uni") === "preuni";
    },
  },
  preUniCategory: { type: String },
  expectedGradYear: { type: String },
  dateOfBirth: { type: String },
  guardianName: { type: String },
  guardianEmail: { type: String },
  guardianPhone: { type: String },
  guardianConsent: { type: Boolean, default: false },
  indemnityMsFormConfirmed: { type: Boolean, default: false },
  matricNo: {
    type: String,
    required: function () {
      return this.uni === "Nanyang Technological University";
    },
  },
  ntuEmail: {
    type: String,
    required: function () {
      return this.uni === "Nanyang Technological University";
    },
  },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  tele: { type: String, required: true },
  course: { type: String, required: true },
  school: { type: String },
  degreeType: {
    type: String,
    required: function () {
      return (this.participantType || "uni") === "uni";
    },
  },
  year: {
    type: String,
    required: function () {
      return (this.participantType || "uni") === "uni";
    },
  },
  nationality: { type: String },
  diet: { type: String },
  size: { type: String, required: true },
  night: { type: Boolean, required: true },
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String },
  members: {
    type: [memberSchema],
    validate: {
      validator: function (members) {
        return this.teamName ? members.length > 0 : true;
      },
      message: "Teams must have at least one member.",
    },
  },
});

const participantSchema = new mongoose.Schema(
  {
    teamName: { type: String, default: null },
    members: { type: [memberSchema], default: undefined },
    solo: { type: memberSchema, default: undefined },
  },
  { timestamps: true }
);

participantSchema.pre("validate", function (next) {
  if (!this.solo && !this.members?.length) {
    return next(
      new Error("Each participant must be either a solo or part of a team.")
    );
  }
  if (this.solo && this.members?.length) {
    return next(
      new Error("A participant cannot be both solo and part of a team.")
    );
  }
  next();
});

const Participant =
  mongoose.models.Participant ||
  mongoose.model("Participant", participantSchema);

export default Participant;
