import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  percentage?: number;
  dollarAmount?: number;
  hasFixedPercentage: boolean;
  hasFixedDollarAmount: boolean;
  calculatedPercentage?: number;
}

export interface Bill {
  id: string;
  totalAmount: number;
  description: string;
  createdAt: Date;
}

interface UserContextType {
  users: User[];
  bills: Bill[];
  addUser: (name: string, percentage?: number, dollarAmount?: number) => void;
  removeUser: (id: string) => void;
  updateUser: (
    id: string,
    name: string,
    percentage?: number,
    dollarAmount?: number
  ) => void;
  addBill: (amount: number, description: string) => void;
  removeBill: (id: string) => void;
  getTotalFixedPercentage: () => number;
  getTotalFixedDollarAmount: () => number;
  getCalculatedAmountsForBill: (bill: Bill) => { user: User; amount: number }[];
  getTotalAmountAllBills: () => number;
  getCalculatedAmountsAllBills: () => { user: User; totalAmount: number }[];
  clearAllData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};

// Storage keys
const STORAGE_KEYS = {
  USERS: "share-splitter-users",
  BILLS: "share-splitter-bills",
};

// Helper functions for localStorage
const saveToStorage = (key: string, data: unknown) => {
  try {
    console.log(`Saving to localStorage [${key}]:`, data); // Debug log
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Successfully saved to localStorage [${key}]`); // Debug log
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    console.log(`Loading from localStorage [${key}]:`, stored); // Debug log
    if (stored) {
      const parsed = JSON.parse(stored);
      // Special handling for bills to convert date strings back to Date objects
      if (key === STORAGE_KEYS.BILLS && Array.isArray(parsed)) {
        const result = parsed.map((bill) => ({
          ...bill,
          createdAt: new Date(bill.createdAt),
        })) as T;
        console.log(`Parsed bills from localStorage:`, result); // Debug log
        return result;
      }
      console.log(`Parsed data from localStorage [${key}]:`, parsed); // Debug log
      return parsed;
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  console.log(`Using default value for [${key}]:`, defaultValue); // Debug log
  return defaultValue;
};

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    const loadedUsers = loadFromStorage(STORAGE_KEYS.USERS, []);
    console.log("Initial users loaded:", loadedUsers);
    return loadedUsers;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const loadedBills = loadFromStorage(STORAGE_KEYS.BILLS, []);
    console.log("Initial bills loaded:", loadedBills);
    return loadedBills;
  });

  // Save to localStorage whenever users change
  useEffect(() => {
    console.log("Users state changed, saving to localStorage:", users);
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  // Save to localStorage whenever bills change
  useEffect(() => {
    console.log("Bills state changed, saving to localStorage:", bills);
    saveToStorage(STORAGE_KEYS.BILLS, bills);
  }, [bills]);

  const addUser = (
    name: string,
    percentage?: number,
    dollarAmount?: number
  ) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      percentage,
      dollarAmount,
      hasFixedPercentage: percentage !== undefined && percentage > 0,
      hasFixedDollarAmount: dollarAmount !== undefined && dollarAmount > 0,
    };
    console.log("Adding new user:", newUser);
    setUsers((prev) => {
      const newUsers = [...prev, newUser];
      console.log("New users state:", newUsers);
      return newUsers;
    });
  };

  const removeUser = (id: string) => {
    console.log("Removing user with id:", id);
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const updateUser = (
    id: string,
    name: string,
    percentage?: number,
    dollarAmount?: number
  ) => {
    console.log("Updating user:", { id, name, percentage, dollarAmount });
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              name,
              percentage,
              dollarAmount,
              hasFixedPercentage: percentage !== undefined && percentage > 0,
              hasFixedDollarAmount:
                dollarAmount !== undefined && dollarAmount > 0,
            }
          : user
      )
    );
  };

  const addBill = (amount: number, description: string) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      totalAmount: amount,
      description,
      createdAt: new Date(),
    };
    console.log("Adding new bill:", newBill);
    setBills((prev) => {
      const newBills = [...prev, newBill];
      console.log("New bills state:", newBills);
      return newBills;
    });
  };

  const removeBill = (id: string) => {
    console.log("Removing bill with id:", id);
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  const getTotalFixedPercentage = () => {
    return users
      .filter((user) => user.hasFixedPercentage)
      .reduce((total, user) => total + (user.percentage || 0), 0);
  };

  const getTotalFixedDollarAmount = () => {
    return users
      .filter((user) => user.hasFixedDollarAmount)
      .reduce((total, user) => total + (user.dollarAmount || 0), 0);
  };

  const getCalculatedAmountsForBill = (bill: Bill) => {
    const flexibleUsers = users.filter(
      (user) => !user.hasFixedPercentage && !user.hasFixedDollarAmount
    );

    const totalFixedPercentage = getTotalFixedPercentage();
    const totalFixedDollarAmount = getTotalFixedDollarAmount();

    // Calculate amount from fixed percentages
    const amountFromPercentages =
      (bill.totalAmount * totalFixedPercentage) / 100;

    // Remaining amount after fixed dollars and percentages
    const remainingAmount = Math.max(
      0,
      bill.totalAmount - totalFixedDollarAmount - amountFromPercentages
    );
    const flexibleUserCount = flexibleUsers.length;
    const amountPerFlexibleUser =
      flexibleUserCount > 0 ? remainingAmount / flexibleUserCount : 0;

    return users.map((user) => {
      let userAmount = 0;
      let calculatedPercentage = 0;

      if (user.hasFixedPercentage) {
        userAmount = (bill.totalAmount * (user.percentage || 0)) / 100;
        calculatedPercentage = user.percentage || 0;
      } else if (user.hasFixedDollarAmount) {
        userAmount = user.dollarAmount || 0;
        calculatedPercentage =
          bill.totalAmount > 0 ? (userAmount / bill.totalAmount) * 100 : 0;
      } else {
        userAmount = amountPerFlexibleUser;
        calculatedPercentage =
          bill.totalAmount > 0 ? (userAmount / bill.totalAmount) * 100 : 0;
      }

      return {
        user: {
          ...user,
          calculatedPercentage,
        },
        amount: userAmount,
      };
    });
  };

  const getTotalAmountAllBills = () => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0);
  };

  const getCalculatedAmountsAllBills = () => {
    const totalAmount = getTotalAmountAllBills();
    if (totalAmount === 0) return [];

    const flexibleUsers = users.filter(
      (user) => !user.hasFixedPercentage && !user.hasFixedDollarAmount
    );

    const totalFixedPercentage = getTotalFixedPercentage();
    const totalFixedDollarAmount = getTotalFixedDollarAmount();

    // Calculate total amount from fixed percentages across all bills
    const amountFromPercentages = (totalAmount * totalFixedPercentage) / 100;

    // Remaining amount after fixed dollars and percentages
    const remainingAmount = Math.max(
      0,
      totalAmount - totalFixedDollarAmount - amountFromPercentages
    );
    const flexibleUserCount = flexibleUsers.length;
    const amountPerFlexibleUser =
      flexibleUserCount > 0 ? remainingAmount / flexibleUserCount : 0;

    return users.map((user) => {
      let userTotalAmount = 0;
      let calculatedPercentage = 0;

      if (user.hasFixedPercentage) {
        userTotalAmount = (totalAmount * (user.percentage || 0)) / 100;
        calculatedPercentage = user.percentage || 0;
      } else if (user.hasFixedDollarAmount) {
        userTotalAmount = user.dollarAmount || 0;
        calculatedPercentage =
          totalAmount > 0 ? (userTotalAmount / totalAmount) * 100 : 0;
      } else {
        userTotalAmount = amountPerFlexibleUser;
        calculatedPercentage =
          totalAmount > 0 ? (userTotalAmount / totalAmount) * 100 : 0;
      }

      return {
        user: {
          ...user,
          calculatedPercentage,
        },
        totalAmount: userTotalAmount,
      };
    });
  };

  const clearAllData = () => {
    console.log("Clearing all data");
    setUsers([]);
    setBills([]);
    // Also clear from localStorage
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    console.log("Data cleared from localStorage");
  };

  // Debug log current state
  console.log("Current state - Users:", users, "Bills:", bills);

  return (
    <UserContext.Provider
      value={{
        users,
        bills,
        addUser,
        removeUser,
        updateUser,
        addBill,
        removeBill,
        getTotalFixedPercentage,
        getTotalFixedDollarAmount,
        getCalculatedAmountsForBill,
        getTotalAmountAllBills,
        getCalculatedAmountsAllBills,
        clearAllData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
