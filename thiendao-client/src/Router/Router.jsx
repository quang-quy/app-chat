import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginComponent  from '../Login/loginComponent.jsx';
import CreateAccount from '../CreateAccount/CreateAccount.jsx';
import LoginLayout from '../Layout/Layout.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
     
        <Route path="/" element={<LoginComponent />} />
        <Route path="/CreateAcc" element={<CreateAccount />} />
      
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
