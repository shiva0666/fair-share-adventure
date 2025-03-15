
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
  return new Promise(resolve => {
    setTimeout(() => {
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
      const groupWithBalances = updateParticipantBalances(updatedGroup);
      
      groups[groupIndex] = groupWithBalances;
      saveGroups(groups);
      
      resolve(groupWithBalances);
    }, 500);
  });
};

// Update expense in a group
export const updateExpense = async (groupId: string, updatedExpense: Expense): Promise<Group> => {
  return new Promise(resolve => {
    setTimeout(() => {
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
      const groupWithBalances = updateParticipantBalances(updatedGroup);
      
      groups[groupIndex] = groupWithBalances;
      saveGroups(groups);
      
      resolve(groupWithBalances);
    }, 500);
  });
};

// Update group status
export const updateGroupStatus = async (
  groupId: string,
  status: 'active' | 'completed'
): Promise<Group> => {
  return new Promise(resolve => {
    setTimeout(() => {
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
