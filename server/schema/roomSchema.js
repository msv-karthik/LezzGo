import mongoose from "mongoose";


const routeSchema = new mongoose.Schema({
  source: {
    type: String,
    trim: true
  },
  destination: {
    type: String,
    trim: true
  },
  stops: {
    type: [String],
    default: []
  },
  selectedRoute: {
    type: String
  },
  distance: {
    type: Number
  },
  duration: {
    type: Number
  }
}, { _id: false });


const pinSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// , { _id: false }


const roomSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Room name is required"],
    trim: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ],

  route: routeSchema,

  pins: {
    type: [pinSchema],
    default: []
  },

  status: {
    type: String,
    enum: ["active", "completed", "archived"],
    default: "active"
  },

  lastActivity: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

export default mongoose.model("Room", roomSchema);