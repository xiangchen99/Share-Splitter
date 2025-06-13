import { useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUsers } from '../context/UserContext';

function Navbar() {
  const { addUser } = useUsers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form
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
        
        addUser(name, finalPercentage, finalDollarAmount);
        form.resetFields();
        setIsModalVisible(false);
        message.success('Participant added successfully!');
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <div className="bg-white shadow-md px-6 py-4 mb-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800">Share Splitter</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Add Participant
          </Button>
        </div>
      </div>

      <Modal
        title="Add New Participant"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add Participant"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_user_form"
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
    </>
  );
}

export default Navbar;