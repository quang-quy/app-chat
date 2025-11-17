import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
  SmileOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Dropdown, message, Card } from 'antd';
import { LogoutAPI, GetDataUser } from '../API/LoginApi';
import { useNavigate } from "react-router-dom";
import Chatbox from '../ChatBox/ChatboxComponent'
import {UploadAvatar}   from '../API/UserApi';


const { Header, Sider, Content } = Layout;

const App = ({ currentUserId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [allUsers, setAllUsers] = useState([]); 
  const [connection, setConnection] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();
  const { token: { borderRadiusLG } } = theme.useToken();

  
useEffect(() => {
  if (!connection) return;

  connection.on("ReceiveMessage", (fromUserId, fromUserName, message) => {

    setMessages(prev => [...prev, { fromUserId, fromUserName, message }]);
  });

  return () => {
    connection.off("ReceiveMessage");
  };
}, [connection]);



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await GetDataUser();
        setUserName(res.data.displayName);
                setUserName(res.data.displayName);
                setAvatar(res.data.avt); 
        console.log("User data fetched:", res.data); 
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

    // Lắng nghe cập nhật trạng thái từng user
    conn.on("UserStatusChanged", (userId, status) => {
      setAllUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, status } : u
      ));
    });

    // Nhận danh sách tất cả user cùng trạng thái từ backend
    conn.on("AllUsersWithStatus", (users) => {
      setAllUsers(users);
    });
    conn.on("AllUsersWithStatus", (users) => {
    setAllUsers(users); 
});

    conn.start()
      .then(() => {
        console.log("Connected to SignalR hub");
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn.invoke("GetAllUsersWithStatus").catch(err => console.error(err));
        }
      })
      .catch(err => console.error("SignalR connection error:", err));

    setConnection(conn);

    return () => {
      conn.stop().catch(err => console.error(err));
    };
  }, []);
  //Send Message

const SendMessage = async () => {
  if (!connection || !selectedUser || !messageText.trim()) return;
  try {

    await connection.invoke("SendMessage", selectedUser.userId.toString(), messageText);
    setMessageText(""); 
  } catch (err) {
    console.error("Send message error:", err);
  }
};


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

const uploadAvatar = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file); // key phải là "file"

    const res = await UploadAvatar(formData); // truyền formData vào API
    message.success("Tải ảnh đại diện thành công");
    console.log("Avatar URL:", res.data.avatarUrl);
     setAvatar(`${res.data.avatarUrl}?t=${Date.now()}`);
  } catch (err) {
    message.error("Tải ảnh đại diện thất bại");
    console.error(err);
  }
};

  const avatarMenu = (
  <Menu>
    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
      Đăng xuất
    </Menu.Item>

    <Menu.Item key="upload" icon={<UploadOutlined />}>
      <label style={{ cursor: "pointer" }}>
        Tải ảnh đại diện
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={uploadAvatar}
        />
      </label>
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
              <Avatar size={50} style={{cursor: 'pointer' }} icon={<UserOutlined />} src= {avatar} />
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
    gap: 16,         // khoảng cách giữa Chatbox và Card
    minHeight: '80vh',
   
    
          }}
        >
         <div style={{   flex: 1, 
  display: 'flex',          // ← bắt buộc
  flexDirection: 'column', 
  justifyContent: 'flex-end'   }}>
    <Chatbox />
  </div>
          <Card style={{ width: 300 }}>
            <p>Trạng thái hoạt động</p>
{allUsers
  .filter(user => String(user.userId) !== String(currentUserId))
  .map(user => (
    <li key={user.userId} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }} onClick={()=>setSelectedUser(user)}>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: user.status === 'Online' ? 'green' : 'red',
          marginRight: 8,
        }}
      />
      {user.displayName}
    </li>

    
  ))
}
</Card>
{selectedUser && (
  <Card style={{ marginTop: 16, width: 400 }}>
    <h3>Chat với {selectedUser.displayName}</h3>
    <div style={{ minHeight: 200, border: "1px solid #ccc", marginBottom: 8, padding: 8 }}>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <b>{msg.fromUserName}:</b> {msg.message}
        </div>
      ))}
    </div>
    <input
      type="text"
      value={messageText}
      onChange={e => setMessageText(e.target.value)}
      onKeyDown={e => e.key === "Enter" && SendMessage()}
      placeholder="Nhập tin nhắn..."
      style={{ width: "100%", padding: 8 }}
    />
    <Button type="primary" onClick={SendMessage} style={{ marginTop: 8 }}>
      Gửi
    </Button>
  </Card>
)}


          
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
