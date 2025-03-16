import { DashboardSummary, Expense, ExpenseAttachment, Participant, Trip } from "@/types";
import { updateParticipantBalances } from "@/utils/expenseCalculator";
import { v4 as uuidv4 } from 'uuid';
import { getGroupStats } from "./groupService";

// Mock data for trips
const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Goa Beach Vacation",
    startDate: "2023-12-15",
    endDate: "2023-12-20",
    status: "completed",
    createdAt: "2023-11-01",
    participants: [
      { id: "p1", name: "Shiva", balance: 0 },
      { id: "p2", name: "Anu", balance: 0 },
      { id: "p3", name: "Rahul", balance: 0 },
    ],
    expenses: [
      {
        id: "e1",
        name: "Hotel Booking",
        amount: 15000,
        category: "accommodation",
        date: "2023-12-15",
        paidBy: "p1",
        splitBetween: ["p1", "p2", "p3"],
      },
      {
        id: "e2",
        name: "Dinner at Beach Shack",
        amount: 3000,
        category: "food",
        date: "2023-12-16",
        paidBy: "p2",
        splitBetween: ["p1", "p2", "p3"],
      },
      {
        id: "e3",
        name: "Taxi Rental",
        amount: 4500,
        category: "transportation",
        date: "2023-12-17",
        paidBy: "p3",
        splitBetween: ["p1", "p2", "p3"],
      },
    ],
  },
  {
    id: "2",
    name: "Manali Trek",
    startDate: "2024-01-10",
    endDate: "2024-01-15",
    status: "active",
    createdAt: "2023-12-20",
    participants: [
      { id: "p1", name: "Shiva", balance: 0 },
      { id: "p4", name: "Priya", balance: 0 },
      { id: "p5", name: "Vikram", balance: 0 },
    ],
    expenses: [
      {
        id: "e4",
        name: "Trek Booking",
        amount: 9000,
        category: "activities",
        date: "2024-01-10",
        paidBy: "p1",
        splitBetween: ["p1", "p4", "p5"],
      },
      {
        id: "e5",
        name: "Warm Clothing Rental",
        amount: 3600,
        category: "shopping",
        date: "2024-01-11",
        paidBy: "p4",
        splitBetween: ["p1", "p4", "p5"],
      },
    ],
  },
];

// Update all trip balances when initializing
const initialTrips = mockTrips.map(trip => updateParticipantBalances(trip));

// Local storage key
const TRIPS_STORAGE_KEY = 'divitrip_trips';

// Load trips from local storage or use empty array (not mock data)
const getStoredTrips = (): Trip[] => {
  const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
  return storedTrips ? JSON.parse(storedTrips) : [];
};

// Save trips to local storage
const saveTrips = (trips: Trip[]): void => {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
};

// Get all trips
export const getAllTrips = async (): Promise<Trip[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getStoredTrips());
    }, 500); // Simulate network delay
  });
};

// Search trips by name
export const searchTrips = async (query: string): Promise<Trip[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      if (!query.trim()) {
        resolve(trips);
        return;
      }
      
      const normalizedQuery = query.toLowerCase().trim();
      const filteredTrips = trips.filter(trip => 
        trip.name.toLowerCase().includes(normalizedQuery) ||
        trip.startDate.includes(normalizedQuery) ||
        trip.endDate.includes(normalizedQuery)
      );
      
      resolve(filteredTrips);
    }, 500);
  });
};

// Get trip by ID
export const getTripById = async (id: string): Promise<Trip | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      resolve(trips.find(trip => trip.id === id));
    }, 500);
  });
};

// Create a new trip
export const createTrip = async (tripData: Omit<Trip, 'id' | 'expenses' | 'createdAt'>): Promise<Trip> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const newTrip: Trip = {
        ...tripData,
        id: uuidv4(),
        expenses: [],
        createdAt: new Date().toISOString(),
      };
      
      const updatedTrips = [...trips, newTrip];
      saveTrips(updatedTrips);
      
      resolve(newTrip);
    }, 500);
  });
};

// Add expense to a trip
export const addExpense = async (tripId: string, expense: Omit<Expense, 'id'>): Promise<Trip> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(trip => trip.id === tripId);
      
      if (tripIndex === -1) {
        throw new Error('Trip not found');
      }
      
      const newExpense: Expense = {
        ...expense,
        id: uuidv4(),
      };
      
      const updatedTrip = {
        ...trips[tripIndex],
        expenses: [...trips[tripIndex].expenses, newExpense],
      };
      
      // Recalculate balances
      const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
      
      trips[tripIndex] = tripWithBalances;
      saveTrips(trips);
      
      resolve(tripWithBalances);
    }, 500);
  });
};

// Update expense in a trip
export const updateExpense = async (tripId: string, updatedExpense: Expense): Promise<Trip> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(trip => trip.id === tripId);
      
      if (tripIndex === -1) {
        throw new Error('Trip not found');
      }
      
      const expenseIndex = trips[tripIndex].expenses.findIndex(e => e.id === updatedExpense.id);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      const updatedExpenses = [...trips[tripIndex].expenses];
      updatedExpenses[expenseIndex] = updatedExpense;
      
      const updatedTrip = {
        ...trips[tripIndex],
        expenses: updatedExpenses,
      };
      
      // Recalculate balances
      const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
      
      trips[tripIndex] = tripWithBalances;
      saveTrips(trips);
      
      resolve(tripWithBalances);
    }, 500);
  });
};

// Delete an expense attachment
export const deleteExpenseAttachment = async (
  tripId: string, 
  expenseId: string, 
  attachmentId: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        const expenseIndex = trips[tripIndex].expenses.findIndex(e => e.id === expenseId);
        
        if (expenseIndex === -1) {
          throw new Error('Expense not found');
        }
        
        const expense = trips[tripIndex].expenses[expenseIndex];
        
        if (!expense.attachments) {
          throw new Error('No attachments found');
        }
        
        const updatedAttachments = expense.attachments.filter(a => a.id !== attachmentId);
        
        // Update the expense with the filtered attachments
        const updatedExpense = {
          ...expense,
          attachments: updatedAttachments.length > 0 ? updatedAttachments : undefined,
        };
        
        // Update the trip with the modified expense
        const updatedExpenses = [...trips[tripIndex].expenses];
        updatedExpenses[expenseIndex] = updatedExpense;
        
        trips[tripIndex] = {
          ...trips[tripIndex],
          expenses: updatedExpenses,
        };
        
        saveTrips(trips);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Update trip status
export const updateTripStatus = async (
  tripId: string,
  status: 'active' | 'completed'
): Promise<Trip> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(trip => trip.id === tripId);
      
      if (tripIndex === -1) {
        throw new Error('Trip not found');
      }
      
      trips[tripIndex] = {
        ...trips[tripIndex],
        status,
      };
      
      saveTrips(trips);
      resolve(trips[tripIndex]);
    }, 500);
  });
};

// Delete a trip
export const deleteTrip = async (tripId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        const updatedTrips = trips.filter(trip => trip.id !== tripId);
        saveTrips(updatedTrips);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Get dashboard summary
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const trips = getStoredTrips();
      const activeTrips = trips.filter(trip => trip.status === 'active').length;
      
      // Get unique participants across all trips
      const allParticipantIds = new Set<string>();
      trips.forEach(trip => {
        trip.participants.forEach(participant => {
          allParticipantIds.add(participant.id);
        });
      });
      
      // Count total expenses
      const totalExpenses = trips.reduce(
        (count, trip) => count + trip.expenses.length,
        0
      );
      
      // Get group statistics
      const groupStats = await getGroupStats();
      
      resolve({
        totalTrips: trips.length,
        activeTrips,
        totalExpenses,
        tripFriends: allParticipantIds.size,
        totalGroups: groupStats.totalGroups,
        activeGroups: groupStats.activeGroups
      });
    }, 500);
  });
};

// Email trip report
export const emailTripReport = async (trip: Trip, email: string): Promise<void> => {
  return new Promise((resolve) => {
    // In a real app, this would call an API to send the email
    console.log(`Sending trip report for ${trip.name} to ${email}`);
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};
