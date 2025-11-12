import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Flex, message, Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LoginAPI } from "../API/LoginApi";
import styles from "./LoginComponent.module.css";

function LoginComponent() {
  const [alertType, setAlertType] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await LoginAPI(values);
      message.success("Đăng nhập thành công");

      setAlertType("success");
      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 1000);
      setTimeout(() => setAlertType(null), 1500);

      console.log("Response:", response.data);

      // Điều hướng sau khi login
      setTimeout(() => navigate("/Home"), 800);
    } catch (error) {
      console.error("Error:", error);
      message.error("Sai tên đăng nhập hoặc mật khẩu");

      setAlertType("error");
      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 1000);
      setTimeout(() => setAlertType(null), 1500);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {alertType && (
          <div
            style={{
              transition: "opacity 0.5s ease",
              opacity: fadeOut ? 0 : 1,
              marginBottom: 16,
              width: "100%",
            }}
          >
            <Alert
              message={
                alertType === "success"
                  ? "Đăng nhập thành công"
                  : "Đăng nhập thất bại!"
              }
              type={alertType}
              showIcon
            />
          </div>
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          style={{ width: "100%" }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Flex justify="space-between" align="center">
              <Link to="/CreateAcc">Tạo tài khoản</Link>
            </Flex>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginComponent;
