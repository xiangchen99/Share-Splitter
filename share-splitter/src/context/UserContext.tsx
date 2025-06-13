import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  percentage?: number; // Make percentage optional
  hasFixedPercentage: boolean; // Track if user has a fixed percentage
}

export interface Bill {
  totalAmount: number;
  description: string;
}

interface UserContextType {
  users: User[];
  bill: Bill;
  addUser: (name: string, percentage?: number) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, name: string, percentage?: number) => void;
  setBill: (amount: number, description: string) => void;
  getTotalFixedPercentage: () => number;
  getCalculatedAmounts: () => { user: User; amount: number }[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [bill, setBillState] = useState<Bill>({ totalAmount: 0, description: '' });

  const addUser = (name: string, percentage?: number) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      percentage,
      hasFixedPercentage: percentage !== undefined
    };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const updateUser = (id: string, name: string, percentage?: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { 
        ...user, 
        name, 
        percentage,
        hasFixedPercentage: percentage !== undefined
      } : user
    ));
  };

  const setBill = (amount: number, description: string) => {
    setBillState({ totalAmount: amount, description });
  };

  const getTotalFixedPercentage = () => {
    return users
      .filter(user => user.hasFixedPercentage)
      .reduce((total, user) => total + (user.percentage || 0), 0);
  };

  const getCalculatedAmounts = () => {
    const fixedUsers = users.filter(user => user.hasFixedPercentage);
    const flexibleUsers = users.filter(user => !user.hasFixedPercentage);
    
    const totalFixedPercentage = getTotalFixedPercentage();
    const remainingPercentage = Math.max(0, 100 - totalFixedPercentage);
    const flexibleUserCount = flexibleUsers.length;
    const percentagePerFlexibleUser = flexibleUserCount > 0 ? remainingPercentage / flexibleUserCount : 0;

    return users.map(user => {
      let userPercentage;
      if (user.hasFixedPercentage) {
        userPercentage = user.percentage || 0;
      } else {
        userPercentage = percentagePerFlexibleUser;
      }
      
      return {
        user: {
          ...user,
          calculatedPercentage: userPercentage
        },
        amount: (bill.totalAmount * userPercentage) / 100
      };
    });
  };

  return (
    <UserContext.Provider value={{
      users,
      bill,
      addUser,
      removeUser,
      updateUser,
      setBill,
      getTotalFixedPercentage,
      getCalculatedAmounts
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}