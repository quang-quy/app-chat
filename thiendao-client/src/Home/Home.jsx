import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Space, Avatar, Dropdown, message, Card } from 'antd';
import { LogoutAPI, GetDataUser } from '../API/LoginApi';
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const App = ({ currentUserId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connection, setConnection] = useState(null);

  const navigate = useNavigate();
  const { token: { borderRadiusLG } } = theme.useToken();

  // Lấy thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await GetDataUser();
        setUserName(res.data.name);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu người dùng:", err);
      }
    };
    fetchUser();
  }, []);

  // Kết nối SignalR
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7008/chathub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // Lắng nghe thay đổi trạng thái online/offline
    conn.on("UserStatusChanged", (userId, status) => {
      setOnlineUsers(prev => {
        const updated = [...prev];
        const index = updated.findIndex(u => u.userId === userId);
        if (status === "Online" && index === -1) {
          updated.push({ userId, displayName: userId }); // tạm thời userId là tên hiển thị, backend nên trả displayName
        } else if (status === "Offline" && index !== -1) {
          updated.splice(index, 1);
        }
        return updated;
      });
    });


    // Nhận danh sách online ban đầu
    conn.on("OnlineUsersList", (users) => {
      setOnlineUsers(users);
    });

    conn.start()
      .then(() => {
        console.log("Connected to SignalR hub");
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn.invoke("GetOnlineUsers").catch(err => console.error(err));
        }
      })
      .catch(err => console.error("SignalR connection error:", err));

    setConnection(conn);

    return () => {
      conn.stop().catch(err => console.error(err));
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await LogoutAPI();
      localStorage.removeItem("token");
      navigate("/");
      message.success("Đăng xuất thành công");
    } catch (err) {
      console.error("Logout error:", err);
      message.error("Lỗi khi đăng xuất");
    }
  };

  const avatarMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            { key: '1', icon: <MessageOutlined />, label: 'Message' },
            { key: '2', icon: <UsergroupAddOutlined />, label: 'Group Chat' },
            { key: '3', icon: <SmileOutlined />, label: 'List Friend' },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: "#2980b9", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 50, height: 50 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 20 }}>
            <div style={{ marginRight: 10 }}>{userName}</div>
            <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={['click']}>
              <Avatar size={50} style={{ backgroundColor: '#87d068', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            backgroundColor: '#dfe6e9',
            borderRadius: borderRadiusLG,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Card style={{ width: 300 }}>
            <p>Trạng thái hoạt động</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {onlineUsers.map(user => (
                <li key={user.userId} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: 'green', // xanh = online
                      marginRight: 8,
                    }}
                  />
                  {user.displayName} {user.userId === currentUserId ? "(Bạn)" : ""}
                </li>
              ))}
            </ul>
            <p>Bạn bè như cái bẹn bà</p>
            <p>Hoạn nạn gọi bạn toàn thuê bao</p>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
