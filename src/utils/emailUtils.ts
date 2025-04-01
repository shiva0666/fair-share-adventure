
import { Trip } from "@/types";
import { emailTripReport } from "@/services/tripService";

export const sendTripReportEmail = async (trip: Trip): Promise<boolean> => {
  try {
    // In a real app, you might get the user's email from context or ask for it
    // For now, we'll just use a prompt
    const email = prompt("Enter email address to send the report:");
    
    if (!email) {
      return false; // User cancelled
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }
    
    await emailTripReport(trip, email);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
