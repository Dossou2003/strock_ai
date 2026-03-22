import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import History from './pages/History';
import Resources from './pages/Resources';
import Professional from './pages/Professional';
import NotFound from './pages/NotFound';
import ChatWindow from './components/chatbot/ChatWindow';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/professional" element={<Professional />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWindow />
      </div>
    </BrowserRouter>
  );
}

export default App;
