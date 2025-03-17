
import { Group, Expense, Participant } from "@/types";
import { updateParticipantBalances } from "@/utils/expenseCalculator";
import { v4 as uuidv4 } from 'uuid';

// Local storage key
const GROUPS_STORAGE_KEY = 'divitrip_groups';

// Load groups from local storage
const getStoredGroups = (): Group[] => {
  const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
  return storedGroups ? JSON.parse(storedGroups) : [];
};

// Save groups to local storage
const saveGroups = (groups: Group[]): void => {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
};

// Get all groups
export const getAllGroups = async (): Promise<Group[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getStoredGroups());
    }, 500); // Simulate network delay
  });
};

// Search groups by name
export const searchGroups = async (query: string): Promise<Group[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const groups = getStoredGroups();
      if (!query.trim()) {
        resolve(groups);
        return;
      }
      
      const normalizedQuery = query.toLowerCase().trim();
      const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(normalizedQuery) ||
        group.description?.toLowerCase().includes(normalizedQuery)
      );
      
      resolve(filteredGroups);
    }, 500);
  });
};

// Get group by ID
export const getGroupById = async (id: string): Promise<Group | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const groups = getStoredGroups();
      resolve(groups.find(group => group.id === id));
    }, 500);
  });
};

// Create a new group
export const createGroup = async (groupData: Omit<Group, 'id' | 'expenses' | 'createdAt' | 'status'> & { status?: 'active' | 'completed' }): Promise<Group> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const groups = getStoredGroups();
      const newGroup: Group = {
        ...groupData,
        id: uuidv4(),
        expenses: [],
        status: groupData.status || 'active',
        createdAt: new Date().toISOString(),
      };
      
      const updatedGroups = [...groups, newGroup];
      saveGroups(updatedGroups);
      
      resolve(newGroup);
    }, 500);
  });
};

// Add expense to a group
export const addExpense = async (groupId: string, expense: Omit<Expense, 'id'>): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        const newExpense: Expense = {
          ...expense,
          id: uuidv4(),
        };
        
        const updatedGroup = {
          ...groups[groupIndex],
          expenses: [...groups[groupIndex].expenses, newExpense],
        };
        
        // Recalculate balances
        const groupWithBalances = updateParticipantBalances(updatedGroup) as Group;
        
        groups[groupIndex] = groupWithBalances;
        saveGroups(groups);
        
        resolve(groupWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Update expense in a group
export const updateExpense = async (groupId: string, updatedExpense: Expense): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        const expenseIndex = groups[groupIndex].expenses.findIndex(e => e.id === updatedExpense.id);
        
        if (expenseIndex === -1) {
          throw new Error('Expense not found');
        }
        
        const updatedExpenses = [...groups[groupIndex].expenses];
        updatedExpenses[expenseIndex] = updatedExpense;
        
        const updatedGroup = {
          ...groups[groupIndex],
          expenses: updatedExpenses,
        };
        
        // Recalculate balances
        const groupWithBalances = updateParticipantBalances(updatedGroup) as Group;
        
        groups[groupIndex] = groupWithBalances;
        saveGroups(groups);
        
        resolve(groupWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Update group status
export const updateGroupStatus = async (
  groupId: string,
  status: 'active' | 'completed'
): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        groups[groupIndex] = {
          ...groups[groupIndex],
          status,
        };
        
        saveGroups(groups);
        resolve(groups[groupIndex]);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Update group details
export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        // Update group with new values
        const updatedGroup = {
          ...groups[groupIndex],
          ...updates
        };
        
        // Recalculate balances if needed
        const groupWithBalances = updateParticipantBalances(updatedGroup) as Group;
        
        groups[groupIndex] = groupWithBalances;
        saveGroups(groups);
        
        resolve(groupWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Add participant to a group
export const addParticipant = async (groupId: string, participant: Omit<Participant, 'balance'>): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        const newParticipant: Participant = {
          ...participant,
          balance: 0
        };
        
        const updatedGroup = {
          ...groups[groupIndex],
          participants: [...groups[groupIndex].participants, newParticipant]
        };
        
        // Recalculate balances
        const groupWithBalances = updateParticipantBalances(updatedGroup) as Group;
        
        groups[groupIndex] = groupWithBalances;
        saveGroups(groups);
        
        resolve(groupWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Remove participant from a group
export const removeParticipant = async (groupId: string, participantId: string): Promise<Group> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        // Remove participant
        const updatedGroup = {
          ...groups[groupIndex],
          participants: groups[groupIndex].participants.filter(p => p.id !== participantId),
          // Also update expenses that involve this participant
          expenses: groups[groupIndex].expenses.map(expense => {
            // Remove the participant from splitBetween
            const updatedSplitBetween = expense.splitBetween.filter(id => id !== participantId);
            
            // Handle paidBy field (could be string or string[])
            let updatedPaidBy = expense.paidBy;
            if (typeof expense.paidBy === 'string') {
              // If this participant was the payer, set to first available participant or empty
              if (expense.paidBy === participantId) {
                const otherParticipants = groups[groupIndex].participants.filter(p => p.id !== participantId);
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
        const groupWithBalances = updateParticipantBalances(updatedGroup) as Group;
        
        groups[groupIndex] = groupWithBalances;
        saveGroups(groups);
        
        resolve(groupWithBalances);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Delete a group
export const deleteGroup = async (groupId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const groups = getStoredGroups();
        const groupIndex = groups.findIndex(group => group.id === groupId);
        
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }
        
        const updatedGroups = groups.filter(group => group.id !== groupId);
        saveGroups(updatedGroups);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// Get group statistics for dashboard
export const getGroupStats = async (): Promise<{ totalGroups: number, activeGroups: number }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const groups = getStoredGroups();
      const activeGroups = groups.filter(group => group.status === 'active').length;
      
      resolve({
        totalGroups: groups.length,
        activeGroups
      });
    }, 500);
  });
};
