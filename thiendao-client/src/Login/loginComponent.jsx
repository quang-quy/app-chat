
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex,message, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LoginAPI,api } from '../API/LoginApi';
import { useState } from "react";
import '../App.css';
function LoginComponent () {

    const [alertType, setAlertType] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
const navigate = useNavigate();
  const onFinish = async (values) => {
 try {

    const payload = values;
    const response = await LoginAPI(payload);
    message.success('đăng nhập thành công');
   setAlertType('success');
   navigate('/Home');
    setFadeOut(false);
    setTimeout(() => setFadeOut(true), 1000); 
    setTimeout(() => setAlertType(null), 1500);
    console.log('Response:', response.data);
  }
  catch (error) {
    setAlertType('error');
    setFadeOut(false);
    setTimeout(() => setFadeOut(true), 1000);
    setTimeout(() => setAlertType(null), 1500);
message.error('Sai tên đăng nhập hoặc mật khẩu');
console.error('Error:', error);
  
  }

  };
    return(
        <div style={{minWidth: '500px'}}>

             {alertType && (
  <div
    style={{
      transition: 'opacity 0.5s ease',
      opacity: fadeOut ? 0 : 1,
      marginBottom: 16,
    }}
  >
    <Alert
      message={alertType === 'success' ? 'Đăng nhập thành công' : 'Đăng nhập thất bại!'}
      type={alertType}
      showIcon
    />
  </div>
)}
                <Form
      name="login"
      initialValues={{ remember: true }}
      style={{ maxWidth: 360 }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please input your Username!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
      >
        <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
      </Form.Item>
      <Form.Item>
        <Flex justify="space-between" align="center">
          {/* <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item> */}
       <Link to="/CreateAcc">Tạo tài khoản</Link>
        </Flex>
      </Form.Item>

      <Form.Item>
        <Button block type="primary" htmlType="submit">
          Log in
        </Button>
    
      </Form.Item>
    </Form>

        </div>
    )

}
export default LoginComponent;