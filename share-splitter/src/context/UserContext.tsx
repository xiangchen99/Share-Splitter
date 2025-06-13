import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  percentage?: number;
  dollarAmount?: number;
  hasFixedPercentage: boolean;
  hasFixedDollarAmount: boolean;
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
  updateUser: (id: string, name: string, percentage?: number, dollarAmount?: number) => void;
  addBill: (amount: number, description: string) => void;
  removeBill: (id: string) => void;
  getTotalFixedPercentage: () => number;
  getTotalFixedDollarAmount: () => number;
  getCalculatedAmountsForBill: (bill: Bill) => { user: User; amount: number }[];
  getTotalAmountAllBills: () => number;
  getCalculatedAmountsAllBills: () => { user: User; totalAmount: number }[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  const addUser = (name: string, percentage?: number, dollarAmount?: number) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      percentage,
      dollarAmount,
      hasFixedPercentage: percentage !== undefined && percentage > 0,
      hasFixedDollarAmount: dollarAmount !== undefined && dollarAmount > 0
    };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const updateUser = (id: string, name: string, percentage?: number, dollarAmount?: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { 
        ...user, 
        name, 
        percentage,
        dollarAmount,
        hasFixedPercentage: percentage !== undefined && percentage > 0,
        hasFixedDollarAmount: dollarAmount !== undefined && dollarAmount > 0
      } : user
    ));
  };

  const addBill = (amount: number, description: string) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      totalAmount: amount,
      description,
      createdAt: new Date()
    };
    setBills(prev => [...prev, newBill]);
  };

  const removeBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  const getTotalFixedPercentage = () => {
    return users
      .filter(user => user.hasFixedPercentage)
      .reduce((total, user) => total + (user.percentage || 0), 0);
  };

  const getTotalFixedDollarAmount = () => {
    return users
      .filter(user => user.hasFixedDollarAmount)
      .reduce((total, user) => total + (user.dollarAmount || 0), 0);
  };

  const getCalculatedAmountsForBill = (bill: Bill) => {
    const fixedPercentageUsers = users.filter(user => user.hasFixedPercentage);
    const fixedDollarUsers = users.filter(user => user.hasFixedDollarAmount);
    const flexibleUsers = users.filter(user => !user.hasFixedPercentage && !user.hasFixedDollarAmount);
    
    const totalFixedPercentage = getTotalFixedPercentage();
    const totalFixedDollarAmount = getTotalFixedDollarAmount();
    
    // Calculate amount from fixed percentages
    const amountFromPercentages = (bill.totalAmount * totalFixedPercentage) / 100;
    
    // Remaining amount after fixed dollars and percentages
    const remainingAmount = Math.max(0, bill.totalAmount - totalFixedDollarAmount - amountFromPercentages);
    const flexibleUserCount = flexibleUsers.length;
    const amountPerFlexibleUser = flexibleUserCount > 0 ? remainingAmount / flexibleUserCount : 0;

    return users.map(user => {
      let userAmount = 0;
      let calculatedPercentage = 0;
      
      if (user.hasFixedPercentage) {
        userAmount = (bill.totalAmount * (user.percentage || 0)) / 100;
        calculatedPercentage = user.percentage || 0;
      } else if (user.hasFixedDollarAmount) {
        userAmount = user.dollarAmount || 0;
        calculatedPercentage = bill.totalAmount > 0 ? (userAmount / bill.totalAmount) * 100 : 0;
      } else {
        userAmount = amountPerFlexibleUser;
        calculatedPercentage = bill.totalAmount > 0 ? (userAmount / bill.totalAmount) * 100 : 0;
      }
      
      return {
        user: {
          ...user,
          calculatedPercentage
        },
        amount: userAmount
      };
    });
  };

  const getTotalAmountAllBills = () => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0);
  };

  const getCalculatedAmountsAllBills = () => {
    const totalAmount = getTotalAmountAllBills();
    if (totalAmount === 0) return [];
    
    const fixedPercentageUsers = users.filter(user => user.hasFixedPercentage);
    const fixedDollarUsers = users.filter(user => user.hasFixedDollarAmount);
    const flexibleUsers = users.filter(user => !user.hasFixedPercentage && !user.hasFixedDollarAmount);
    
    const totalFixedPercentage = getTotalFixedPercentage();
    const totalFixedDollarAmount = getTotalFixedDollarAmount();
    
    // Calculate total amount from fixed percentages across all bills
    const amountFromPercentages = (totalAmount * totalFixedPercentage) / 100;
    
    // Remaining amount after fixed dollars and percentages
    const remainingAmount = Math.max(0, totalAmount - totalFixedDollarAmount - amountFromPercentages);
    const flexibleUserCount = flexibleUsers.length;
    const amountPerFlexibleUser = flexibleUserCount > 0 ? remainingAmount / flexibleUserCount : 0;

    return users.map(user => {
      let userTotalAmount = 0;
      let calculatedPercentage = 0;
      
      if (user.hasFixedPercentage) {
        userTotalAmount = (totalAmount * (user.percentage || 0)) / 100;
        calculatedPercentage = user.percentage || 0;
      } else if (user.hasFixedDollarAmount) {
        userTotalAmount = user.dollarAmount || 0;
        calculatedPercentage = totalAmount > 0 ? (userTotalAmount / totalAmount) * 100 : 0;
      } else {
        userTotalAmount = amountPerFlexibleUser;
        calculatedPercentage = totalAmount > 0 ? (userTotalAmount / totalAmount) * 100 : 0;
      }
      
      return {
        user: {
          ...user,
          calculatedPercentage
        },
        totalAmount: userTotalAmount
      };
    });
  };

  return (
    <UserContext.Provider value={{
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
      getCalculatedAmountsAllBills
    }}>
      {children}
    </UserContext.Provider>
  );
}