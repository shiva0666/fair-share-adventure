import { DashboardSummary, Expense, ExpenseAttachment, Participant, Trip } from "@/types";
import { updateParticipantBalances } from "@/utils/expenseCalculator";
import { v4 as uuidv4 } from 'uuid';
import { getGroupStats } from "./groupService";

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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
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
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Update expense in a trip
export const updateExpense = async (tripId: string, updatedExpense: Expense): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
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
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Delete expense from a trip
export const deleteExpense = async (tripId: string, expenseId: string): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        const updatedTrip = {
          ...trips[tripIndex],
          expenses: trips[tripIndex].expenses.filter(e => e.id !== expenseId)
        };
        
        // Recalculate balances
        const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
        
        trips[tripIndex] = tripWithBalances;
        saveTrips(trips);
        
        resolve(tripWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Delete expense attachment
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

// Update trip details (name, dates, currency, etc.)
export const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        // Update trip with new values
        const updatedTrip = {
          ...trips[tripIndex],
          ...updates
        };
        
        // Recalculate balances if needed
        const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
        
        trips[tripIndex] = tripWithBalances;
        saveTrips(trips);
        
        resolve(tripWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Add participant to a trip
export const addParticipant = async (tripId: string, participant: Omit<Participant, 'balance'>): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        const newParticipant: Participant = {
          ...participant,
          balance: 0
        };
        
        const updatedTrip = {
          ...trips[tripIndex],
          participants: [...trips[tripIndex].participants, newParticipant]
        };
        
        // Recalculate balances
        const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
        
        trips[tripIndex] = tripWithBalances;
        saveTrips(trips);
        
        resolve(tripWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Remove participant from a trip
export const removeParticipant = async (tripId: string, participantId: string): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        // Remove participant
        const updatedTrip = {
          ...trips[tripIndex],
          participants: trips[tripIndex].participants.filter(p => p.id !== participantId),
          // Also update expenses that involve this participant
          expenses: trips[tripIndex].expenses.map(expense => {
            // Remove the participant from splitBetween
            const updatedSplitBetween = expense.splitBetween.filter(id => id !== participantId);
            
            // Handle paidBy field (could be string or string[])
            let updatedPaidBy = expense.paidBy;
            if (typeof expense.paidBy === 'string') {
              // If this participant was the payer, set to first available participant or empty
              if (expense.paidBy === participantId) {
                const otherParticipants = trips[tripIndex].participants.filter(p => p.id !== participantId);
                updatedPaidBy = otherParticipants.length > 0 ? otherParticipants[0].id : '';
              }
            } else if (Array.isArray(expense.paidBy)) {
              // Remove this participant from the payers array
              updatedPaidBy = expense.paidBy.filter(id => id !== participantId);
            }
            
            // Update or remove payerAmounts for this participant
            let updatedPayerAmounts = expense.payerAmounts;
            if (updatedPayerAmounts && participantId in updatedPayerAmounts) {
              const { [participantId]: removed, ...rest } = updatedPayerAmounts;
              updatedPayerAmounts = rest;
            }
            
            // Update or remove splitAmounts for this participant
            let updatedSplitAmounts = expense.splitAmounts;
            if (updatedSplitAmounts && participantId in updatedSplitAmounts) {
              const { [participantId]: removed, ...rest } = updatedSplitAmounts;
              updatedSplitAmounts = rest;
            }
            
            return {
              ...expense,
              paidBy: updatedPaidBy,
              splitBetween: updatedSplitBetween,
              payerAmounts: updatedPayerAmounts,
              splitAmounts: updatedSplitAmounts
            };
          })
        };
        
        // Recalculate balances
        const tripWithBalances = updateParticipantBalances(updatedTrip) as Trip;
        
        trips[tripIndex] = tripWithBalances;
        saveTrips(trips);
        
        resolve(tripWithBalances);
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
          throw new Error('Trip not found');
        }
        
        const updatedTrip = {
          ...trips[tripIndex],
          status
        };
        
        trips[tripIndex] = updatedTrip;
        saveTrips(trips);
        
        resolve(updatedTrip);
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
      
      let totalExpenses = 0;
      let tripParticipants = new Set<string>();
      
      trips.forEach(trip => {
        // Add up expense amounts
        trip.expenses.forEach(expense => {
          totalExpenses += expense.amount;
        });
        
        // Get unique participants
        trip.participants.forEach(participant => {
          tripParticipants.add(participant.id);
        });
      });
      
      // Get group stats if necessary
      const groupStats = await getGroupStats();
      
      const summary: DashboardSummary = {
        totalTrips: trips.length,
        totalExpenses: Math.round(totalExpenses),
        activeTrips: trips.filter(trip => trip.status === 'active').length,
        tripFriends: tripParticipants.size,
        totalGroups: groupStats?.totalGroups || 0,
        activeGroups: groupStats?.activeGroups || 0
      };
      
      resolve(summary);
    }, 500);
  });
};

// Create an expense
export const createExpense = async (tripId: string, expense: Omit<Expense, "id">): Promise<Expense> => {
  // This is a mock implementation
  const newExpense = {
    id: crypto.randomUUID(),
    ...expense
  };
  
  // In a real app, you would make an API call here
  console.log(`Creating expense for trip ${tripId}:`, newExpense);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return newExpense as Expense;
};

// Delete a trip
export const deleteTrip = async (tripId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const trips = getStoredTrips();
        const updatedTrips = trips.filter(trip => trip.id !== tripId);
        
        if (trips.length === updatedTrips.length) {
          throw new Error('Trip not found');
        }
        
        saveTrips(updatedTrips);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Email a trip report
export const emailTripReport = async (tripId: string, email: string): Promise<void> => {
  console.log(`Emailing trip report for trip ${tripId} to ${email}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return;
};
