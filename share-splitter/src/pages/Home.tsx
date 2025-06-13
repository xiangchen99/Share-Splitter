import { useState } from 'react';
import { Card, Typography, Input, Button, Alert } from 'antd';
import { useUsers } from '../context/UserContext';

const { Title, Text } = Typography;

export default function Home() {
  const { bills, addBill, removeBill, users, getCalculatedAmountsForBill, getTotalAmountAllBills, getCalculatedAmountsAllBills } = useUsers();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleAddBill = () => {
    const billAmount = parseFloat(amount);
    if (isNaN(billAmount) || billAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    addBill(billAmount, description);
    setAmount('');
    setDescription('');
  };

  const totalAmount = getTotalAmountAllBills();
  const totalCalculatedAmounts = getCalculatedAmountsAllBills();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100">
      <Title level={1} className="text-center">Share Splitter</Title>
      
      {/* Bill Input */}
      <Card className="mb-6">
        <Title level={3}>Add New Bill</Title>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bill Amount ($)</label>
            <Input 
              type="number" 
              placeholder="Enter total amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Input 
              placeholder="Restaurant bill, groceries, etc." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button 
            type="primary" 
            className="bg-blue-500"
            onClick={handleAddBill}
          >
            Add Bill
          </Button>
        </div>
      </Card>

      {/* Bills List */}
      {bills.length > 0 && (
        <Card className="mb-6">
          <Title level={3}>Current Bills</Title>
          <div className="space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <Text strong>${bill.totalAmount.toFixed(2)}</Text>
                  {bill.description && <Text className="ml-2 text-gray-600">- {bill.description}</Text>}
                  <Text className="block text-sm text-gray-500">
                    {bill.createdAt.toLocaleDateString()}
                  </Text>
                </div>
                <Button 
                  danger 
                  size="small"
                  onClick={() => removeBill(bill.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Text strong className="text-lg">Total Amount: ${totalAmount.toFixed(2)}</Text>
              <Text><strong>Bills:</strong> {bills.length}</Text>
            </div>
            <Text><strong>Participants:</strong> {users.length}</Text>
          </div>
        </Card>
      )}

      {/* Total Calculation Results */}
      {totalCalculatedAmounts.length > 0 && totalAmount > 0 && (
        <Card>
          <Title level={4}>Total Split Breakdown</Title>
          <div className="space-y-2">
            {totalCalculatedAmounts.map(({ user, totalAmount: userAmount }) => (
              <div key={user.id} className="flex justify-between p-2 bg-white rounded">
                <span>{user.name} ({user.calculatedPercentage?.toFixed(1)}%)</span>
                <span className="font-semibold">${userAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Individual Bill Breakdowns */}
      {bills.length > 0 && users.length > 0 && (
        <div className="mt-6 space-y-4">
          <Title level={4}>Individual Bill Breakdowns</Title>
          {bills.map((bill) => {
            const billCalculations = getCalculatedAmountsForBill(bill);
            return (
              <Card key={bill.id} className="bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <Text strong>{bill.description || 'Unnamed Bill'}</Text>
                  <Text strong>${bill.totalAmount.toFixed(2)}</Text>
                </div>
                <div className="space-y-1">
                  {billCalculations.map(({ user, amount }) => (
                    <div key={user.id} className="flex justify-between text-sm">
                      <span>{user.name}</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}