import mongoose from "mongoose";

const NotificationItemSchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, 
    isRead: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }, 
  },
  { _id: false }
);

const NotificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    
    },
    notifications: [NotificationItemSchema], 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
