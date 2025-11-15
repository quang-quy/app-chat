import { Button, Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState, useEffect } from "react";
import {SendOutlined}  from '@ant-design/icons';

// import { HubConnectionBuilder } from "@microsoft/signalr";

const ChatBox = () => {
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

//   useEffect(() => {
//     const newConnection = new HubConnectionBuilder()
//       .withUrl("https://localhost:5001/chathub") // URL backend SignalR
//       .withAutomaticReconnect()
//       .build();

//     setConnection(newConnection);
//   }, []);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
        console.log("Connected to SignalR");

        connection.on("ReceiveMessage", (user, message) => {
          setChat((prev) => [...prev, { user, message }]);
        });
      });
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && message.trim()) {
      const user = localStorage.getItem("username"); // hoặc lấy từ token
      await connection.invoke("SendMessage", user, message);
      setMessage("");
    }
  };

   return (
 <Row justify="center" align="middle" style={{ background: "#f5f5f5", width:"100%" }}>
<div style={{ width: '100%', backgroundColor:'rgb(223, 230, 233)' }}>
  {/* Nhập tin nhắn */}
 <TextArea
  rows={3}
  placeholder="Nhập tin nhắn..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onPressEnter={(e) => {
    e.preventDefault();   // tránh xuống dòng
    sendMessage();        // gọi hàm gửi tin nhắn
      console.log("Enter pressed! Tin nhắn hiện tại:", message);
  }}
/>

  
  {/* Button nằm dưới, bên phải */}
  <div style={{ textAlign: 'right', marginTop: 8 }}>
    <Button type="primary" style={{ minWidth: 100, padding: '0 24px' }}>
      <SendOutlined />
    </Button>
  </div>
</div>

</Row>

  );
};

export default ChatBox;
