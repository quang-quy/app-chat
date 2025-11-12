import React from "react";
import { Button, Form, Input, Space, message,Alert } from 'antd';
import {CreateAccountAPI}  from '../API/ManageApi'
import { useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} không hợp lệ!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};


               


export default function CreateAccount() {

  const [alertType, setAlertType] = useState(null);
const [fadeOut, setFadeOut] = useState(false);
const [form] = Form.useForm();
const onFinish = async (values)=> {
  try {
    const payload = values.user;
    const response = await CreateAccountAPI(payload);
    message.success('Tạo tài khoản thành công!');
    setAlertType('success');
    setFadeOut(false);
    setTimeout(() => setFadeOut(true), 1000); // bắt đầu fade sau 1s
    setTimeout(() => setAlertType(null), 1500);
    console.log('Response:', response.data);
  }
  catch (error) {
message.error('Tạo tài khoản thất bại!');
console.error('Error:', error);
setAlertType('error');
    setFadeOut(false);
    setTimeout(() => setFadeOut(true), 1000);
    setTimeout(() => setAlertType(null), 1500);
  }
}
  
    return (<div style={{minWidth:500}}>


    {alertType && (
  <div
    style={{
      transition: 'opacity 0.5s ease',
      opacity: fadeOut ? 0 : 1,
      marginBottom: 16,
    }}
  >
    <Alert
      message={alertType === 'success' ? 'Tạo tài khoản thành công!' : 'Tạo tài khoản thất bại!'}
      type={alertType}
      showIcon
    />
  </div>
)}


  <Form
  {...layout}
  name="nest-messages"
  onFinish={onFinish}
  style={{ maxWidth: 600 }}
  validateMessages={validateMessages}
>
  <Form.Item name={['user', 'UserName']} label="Tài khoản" rules={[{ required: true }]}>
    <Input />
  </Form.Item>

  <Form.Item name={['user', 'DisplayName']} label="Tên hiển thị" rules={[{ required: true }]}>
    <Input />
  </Form.Item>

  <Form.Item
    name={['user', 'Password']}
    label="Password"
    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
  >
    <Input.Password />
  </Form.Item>

  <Form.Item name={['user', 'Email']} label="Email" rules={[{ type: 'email' }]}>
    <Input />
  </Form.Item>

  <Form.Item name={['user', 'Introduce']} label="Introduction">
    <Input.TextArea />
  </Form.Item>

  <Form.Item label={null}>
    <Button type="primary" htmlType="submit">
      Tạo tài khoản
    </Button>
  </Form.Item>
</Form>

    </div>)
}