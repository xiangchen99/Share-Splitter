import { useState } from 'react';
import { Card, Typography, Input, Button, Alert, Tag, Modal, Form, InputNumber, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUsers } from '../context/UserContext';

const { Title, Text } = Typography;

function UsersList() {
  const { 
    users, 
    bills,
    addUser, 
    removeUser, 
    updateUser,
    getTotalFixedPercentage, 
    getTotalFixedDollarAmount,
    getCalculatedAmountsAllBills,
    getTotalAmountAllBills,
    clearAllData
  } = useUsers();
  
  const [newName, setNewName] = useState('');
  const [newPercentage, setNewPercentage] = useState<number>(0);
  const [newDollarAmount, setNewDollarAmount] = useState<number>(0);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm] = Form.useForm();

  const handleAddUser = () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    const finalPercentage = newPercentage > 0 ? newPercentage : undefined;
    const finalDollarAmount = newDollarAmount > 0 ? newDollarAmount : undefined;
    
    if (finalPercentage && finalDollarAmount) {
      alert('Please enter either a percentage OR a dollar amount, not both');
      return;
    }
    
    addUser(newName.trim(), finalPercentage, finalDollarAmount);
    setNewName('');
    setNewPercentage(0);
    setNewDollarAmount(0);
  };

  const handleEditUser = (user: { id: string; name: string; percentage?: number; dollarAmount?: number }) => {
    setEditingUser(user.id);
    editForm.setFieldsValue({
      name: user.name,
      percentage: user.percentage || 0,
      dollarAmount: user.dollarAmount || 0
    });
  };

  const handleUpdateUser = () => {
    editForm
      .validateFields()
      .then((values) => {
        const { name, percentage, dollarAmount } = values;
        
        // Validate that user didn't enter both percentage and dollar amount
        if (percentage > 0 && dollarAmount > 0) {
          message.error('Please enter either a percentage OR a dollar amount, not both');
          return;
        }
        
        const finalPercentage = percentage > 0 ? percentage : undefined;
        const finalDollarAmount = dollarAmount > 0 ? dollarAmount : undefined;
        
        updateUser(editingUser!, name, finalPercentage, finalDollarAmount);
        setEditingUser(null);
        editForm.resetFields();
        message.success('Participant updated successfully!');
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    editForm.resetFields();
  };

  const handleClearAllData = () => {
    clearAllData();
    message.success('All data cleared successfully!');
  };

  const totalFixedPercentage = getTotalFixedPercentage();
  const totalFixedDollarAmount = getTotalFixedDollarAmount();
  const calculatedAmounts = getCalculatedAmountsAllBills();
  const flexibleUsers = users.filter(user => !user.hasFixedPercentage && !user.hasFixedDollarAmount);
  const remainingPercentage = Math.max(0, 100 - totalFixedPercentage);
  const totalAmount = getTotalAmountAllBills();
  const remainingDollarAmount = Math.max(0, totalAmount - totalFixedDollarAmount - (totalAmount * totalFixedPercentage / 100));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Split Participants</Title>
        {(users.length > 0 || bills.length > 0) && (
          <Popconfirm
            title="Clear all data"
            description="Are you sure you want to delete all participants and bills? This cannot be undone."
            onConfirm={handleClearAllData}
            okText="Yes, clear all"
            cancelText="Cancel"
            okType="danger"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Clear All Data
            </Button>
          </Popconfirm>
        )}
      </div>
      
      {/* Add User Form */}
      <Card className="mb-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input 
              placeholder="Enter participant name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Percentage (%) - Optional</label>
              <Input 
                type="number" 
                placeholder="e.g., 25" 
                value={newPercentage || ''} 
                onChange={(e) => setNewPercentage(Number(e.target.value))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dollar Amount ($) - Optional</label>
              <Input 
                type="number" 
                placeholder="e.g., 50" 
                value={newDollarAmount || ''} 
                onChange={(e) => setNewDollarAmount(Number(e.target.value))} 
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Leave both empty for flexible split, or enter either percentage OR dollar amount (not both)
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

      {/* Warnings */}
      {totalFixedPercentage > 100 && (
        <Alert 
          message="Warning: Fixed percentages exceed 100%" 
          type="error" 
          className="mb-4" 
        />
      )}
      
      {totalAmount > 0 && remainingDollarAmount < 0 && (
        <Alert 
          message="Warning: Fixed amounts exceed total bill amount" 
          type="error" 
          className="mb-4" 
        />
      )}
      
      {flexibleUsers.length > 0 && remainingDollarAmount <= 0 && remainingPercentage <= 0 && (
        <Alert 
          message="Warning: No amount remaining for flexible users" 
          type="warning" 
          className="mb-4" 
        />
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {calculatedAmounts.map(({ user, totalAmount: amount }) => (
          <Card key={user.id} className="flex justify-between items-center">
            <div className="flex justify-between items-center w-full">
              <div>
                <div className="flex items-center gap-2">
                  <Text strong className="text-lg">{user.name}</Text>
                  {user.hasFixedPercentage && (
                    <Tag color="blue">Fixed: {user.percentage}%</Tag>
                  )}
                  {user.hasFixedDollarAmount && (
                    <Tag color="purple">Fixed: ${user.dollarAmount}</Tag>
                  )}
                  {!user.hasFixedPercentage && !user.hasFixedDollarAmount && (
                    <Tag color="green">Flexible: {user.calculatedPercentage?.toFixed(1)}%</Tag>
                  )}
                </div>
                <div className="text-gray-500">
                  {totalAmount > 0 && (
                    <span>${amount.toFixed(2)} total</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </Button>
                <Button 
                  danger 
                  size="small"
                  onClick={() => removeUser(user.id)}
                >
                  Remove
                </Button>
              </div>
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
              <Text strong>Fixed Dollar Amount: ${totalFixedDollarAmount}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text strong>Remaining: {remainingPercentage}%</Text>
              <Text strong>Remaining Amount: ${remainingDollarAmount.toFixed(2)}</Text>
            </div>
            {flexibleUsers.length > 0 && (
              <div className="flex justify-between items-center">
                <Text>Flexible Users: {flexibleUsers.length}</Text>
                <Text>Each gets: ${flexibleUsers.length > 0 ? (remainingDollarAmount / flexibleUsers.length).toFixed(2) : '0.00'}</Text>
              </div>
            )}
            {totalAmount > 0 && (
              <div className="flex justify-between items-center">
                <Text strong>Total Bills: ${totalAmount.toFixed(2)}</Text>
                <Text strong>Number of Bills: {bills.length}</Text>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal
        title="Edit Participant"
        open={editingUser !== null}
        onOk={handleUpdateUser}
        onCancel={handleCancelEdit}
        okText="Update Participant"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_user_form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the user name!' },
              { min: 1, message: 'Name cannot be empty!' }
            ]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Percentage (%)"
            name="percentage"
            help="Enter a percentage (e.g., 25 for 25%)"
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Enter percentage (optional)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Dollar Amount ($)"
            name="dollarAmount"
            help="Enter a fixed dollar amount (e.g., 50 for $50)"
          >
            <InputNumber
              min={0}
              placeholder="Enter dollar amount (optional)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div className="text-sm text-gray-600 mt-2">
            <strong>Note:</strong> Leave both empty for flexible split, or enter either percentage OR dollar amount (not both)
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersList;