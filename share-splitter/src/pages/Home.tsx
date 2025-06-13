import { Button, Input, Card, Typography } from "antd";
import { useState } from "react";
import { useUsers } from "../context/UserContext";

const { Title } = Typography;

export default function Home() {
  const { bill, setBill, users, getCalculatedAmounts } = useUsers();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSetBill = () => {
    const billAmount = parseFloat(amount);
    if (isNaN(billAmount) || billAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setBill(billAmount, description);
    setAmount('');
    setDescription('');
  };

  const calculatedAmounts = getCalculatedAmounts();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <Title level={1} className="text-center">Share Splitter</Title>
      
      {/* Bill Input */}
      <Card className="mb-6">
        <Title level={3}>Enter Bill Details</Title>
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
            onClick={handleSetBill}
          >
            Set Bill
          </Button>
        </div>
      </Card>

      {/* Current Bill Display */}
      {bill.totalAmount > 0 && (
        <Card className="mb-6">
          <Title level={4}>Current Bill</Title>
          <p><strong>Amount:</strong> ${bill.totalAmount.toFixed(2)}</p>
          {bill.description && <p><strong>Description:</strong> {bill.description}</p>}
          <p><strong>Participants:</strong> {users.length}</p>
        </Card>
      )}

      {/* Calculation Results */}
      {calculatedAmounts.length > 0 && bill.totalAmount > 0 && (
        <Card>
          <Title level={4}>Split Breakdown</Title>
          <div className="space-y-2">
            {calculatedAmounts.map(({ user, amount }) => (
              <div key={user.id} className="flex justify-between p-2 bg-white rounded">
                <span>{user.name} ({user.percentage}%)</span>
                <span className="font-semibold">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}