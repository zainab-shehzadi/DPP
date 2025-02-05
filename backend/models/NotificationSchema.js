import mongoose from "mongoose";

const NotificationItemSchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, // The notification message
    isRead: { type: Boolean, default: false }, // Whether the notification is read
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the notification was created
  },
  { _id: false } // Disables _id for sub-documents in the array
);

const NotificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    
    },
    notifications: [NotificationItemSchema], // Array of notification objects
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` timestamps
  }
);

export default mongoose.model("Notification", NotificationSchema);
