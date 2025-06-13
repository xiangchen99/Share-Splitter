import { Button, Modal, Input, Form, InputNumber } from "antd";
import { useState } from "react";
import { useUsers } from "../context/UserContext";

function Navbar() {
  const { users, addUser } = useUsers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const { name, percentage } = values;
      // If percentage is 0, null, or undefined, treat as flexible user
      const finalPercentage = percentage > 0 ? percentage : undefined;
      addUser(name, finalPercentage);
      form.resetFields();
      setIsModalVisible(false);
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="flex items-center">
          <a
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-800"
          >
            Share Splitter
          </a>
        </div>
        <div className="flex space-x-6">
          <a
            href="/about"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            About
          </a>
          <a
            href="/contact"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Contact
          </a>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={showModal}
          >
            Add User ({users.length} users)
          </Button>
        </div>
      </nav>

      <Modal
        title="Add New User"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add User"
        cancelText="Cancel"
        okButtonProps={{
          className: "bg-blue-500 hover:bg-blue-600"
        }}
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
            help="Leave empty or set to 0 to split remaining percentage equally among flexible users"
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Enter percentage (optional)"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Navbar;