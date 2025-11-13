import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Space,Avatar, Dropdown,message } from 'antd';
import { LogoutAPI,GetDataUser } from '../API/LoginApi';
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;



const App  = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName ]= useState("");


useEffect(()=> {
const getDataUser = async () => {
  try {
 
    const response = await GetDataUser()
    console.log(response.data, "kết quả trả về")
    setUserName( response.data.name);
  }
  catch (error) {
console.error("Lỗi lấy dữ liệu người dùng:", error);
  }
}
getDataUser();
},[])


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

    const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await LogoutAPI();
    localStorage.removeItem("token");
    navigate("/");
    message.success("Đăng xuất thành công");
  } catch (error) {
    console.error("Logout error:", error);
    message.error("Lỗi khi đăng xuất");
  }
};

   const avatarMenu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick= {handleLogout}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{height:"100vh"}}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <MessageOutlined />,
              label: 'Message',
            },
            {
              key: '2',
              icon: <UsergroupAddOutlined />,
              label: 'Group Chat',
            },
            {
              key: '3',
              icon: <SmileOutlined />,
              label: 'List Friend',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#2980b9" }}>

         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
<Space size={26} wrap style={{ marginRight: '20px' }}>
  <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={['click']}>
    <div style={{ textAlign: 'center', cursor: 'pointer' }}>
      <Avatar
        size={50}
        style={{ backgroundColor: '#87d068' }}
        icon={<UserOutlined />}
      />


    </div>
  </Dropdown>
</Space>
<div style={{marginRight:20}}>{userName}</div>
  </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 50,
              height: 50,
             
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;