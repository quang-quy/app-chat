import { Button, Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState, useEffect } from "react";

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
    <Row justify="center" align="middle" style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Col xs={22} sm={18} md={12} lg={10} xl={8}>
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "80vh", 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          padding: 16 
        }}>
          {/* Khung chat */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, border: "1px solid #eee", padding: 10 }}>
            {/* Tin nhắn sẽ render ở đây */}
            <div><strong>admin:</strong> Hello!</div>
            <div><strong>bạn:</strong> Hi!</div>
          </div>

          {/* Nhập tin nhắn */}
          <TextArea rows={3} placeholder="Nhập tin nhắn..." />
          <Button type="primary" block style={{ marginTop: 8 }}>
            Gửi tin nhắn
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default ChatBox;
