import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginComponent  from '../Login/loginComponent.jsx';
import CreateAccount from '../CreateAccount/CreateAccount.jsx';
import LoginLayout from '../Layout/Layout.jsx';
import Home from '../Home/Home.jsx';
import ChatBox from '../ChatBox/ChatboxComponent.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
     
        <Route path="/" element={<LoginComponent />} />
        <Route path="/CreateAcc" element={<CreateAccount />} />
             <Route path="/Home" element={<Home />} />
                <Route path="/Chatbox" element={<ChatBox />} />
      
<Route
  path="/"
  element={
    <LoginLayout>
      <LoginComponent />
    </LoginLayout>
  }
/>
        
      </Routes>
    </BrowserRouter>
  );
}
