import { useState } from 'react';
import { Button, Input, Card, Typography, Alert, Tag } from 'antd';
import { useUsers } from '../context/UserContext';

const { Title, Text } = Typography;

function UsersList() {
  const { 
    users, 
    addUser, 
    removeUser, 
    getTotalFixedPercentage, 
    getCalculatedAmounts,
    bill 
  } = useUsers();
  
  const [newName, setNewName] = useState('');
  const [newPercentage, setNewPercentage] = useState<number>(0);

  const handleAddUser = () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    const finalPercentage = newPercentage > 0 ? newPercentage : undefined;
    addUser(newName.trim(), finalPercentage);
    setNewName('');
    setNewPercentage(0);
  };

  const totalFixedPercentage = getTotalFixedPercentage();
  const calculatedAmounts = getCalculatedAmounts();
  const flexibleUsers = users.filter(user => !user.hasFixedPercentage);
  const remainingPercentage = Math.max(0, 100 - totalFixedPercentage);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Title level={2}>Split Participants</Title>
      
      {/* Add User Form */}
      <Card className="mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input 
              placeholder="Enter participant name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Percentage (%) - Optional</label>
            <Input 
              type="number" 
              placeholder="Leave empty for flexible split" 
              value={newPercentage || ''} 
              onChange={(e) => setNewPercentage(Number(e.target.value))} 
            />
          </div>
          <Button 
            type="primary" 
            className="bg-blue-500 hover:bg-blue-600" 
            onClick={handleAddUser}
          >
            Add Participant
          </Button>
        </div>
      </Card>

      {/* Percentage Warnings */}
      {totalFixedPercentage > 100 && (
        <Alert 
          message="Warning: Fixed percentages exceed 100%" 
          type="error" 
          className="mb-4" 
        />
      )}
      
      {flexibleUsers.length > 0 && remainingPercentage <= 0 && (
        <Alert 
          message="Warning: No percentage remaining for flexible users" 
          type="warning" 
          className="mb-4" 
        />
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {calculatedAmounts.map(({ user, amount }) => (
          <Card key={user.id} className="flex justify-between items-center">
            <div className="flex justify-between items-center w-full">
              <div>
                <div className="flex items-center gap-2">
                  <Text strong className="text-lg">{user.name}</Text>
                  {user.hasFixedPercentage ? (
                    <Tag color="blue">Fixed: {user.percentage}%</Tag>
                  ) : (
                    <Tag color="green">Flexible: {user.calculatedPercentage?.toFixed(1)}%</Tag>
                  )}
                </div>
                <div className="text-gray-500">
                  {bill.totalAmount > 0 && (
                    <span>${amount.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <Button 
                danger 
                size="small"
                onClick={() => removeUser(user.id)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {users.length > 0 && (
        <Card className="mt-6 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Text strong>Fixed Percentage: {totalFixedPercentage}%</Text>
              <Text strong>Remaining: {remainingPercentage}%</Text>
            </div>
            {flexibleUsers.length > 0 && (
              <div className="flex justify-between items-center">
                <Text>Flexible Users: {flexibleUsers.length}</Text>
                <Text>Each gets: {flexibleUsers.length > 0 ? (remainingPercentage / flexibleUsers.length).toFixed(1) : 0}%</Text>
              </div>
            )}
            {bill.totalAmount > 0 && (
              <div className="flex justify-between items-center">
                <Text strong>Total Bill: ${bill.totalAmount.toFixed(2)}</Text>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default UsersList;