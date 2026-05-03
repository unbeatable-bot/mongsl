import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import CropPage from './pages/CropPage';
import CalculatorPage from './pages/CalculatorPage';
import PortfolioPage from './pages/PortfolioPage';
import { ThemeProvider } from './contexts/ThemeContext';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <ThemeProvider>
      <ModalProvider>
        <Router>
          <Routes>
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/" element={<CropPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/info" element={<InfoPage />} />
          </Routes>
        </Router>
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;