import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import HomePage from './pages/HomePage';
import CropPage from './pages/CropPage';
import CalculatorPage from './pages/CalculatorPage';
import PortfolioPage from './pages/PortfolioPage';

function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/crop" element={<CropPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;