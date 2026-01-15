import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConsentPage } from './pages/ConsentPage';
import { BasicInfoPage } from './pages/BasicInfoPage';
import { RiskCheckPage } from './pages/RiskCheckPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { ResultPage } from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsentPage />} />
        <Route path="/basic-info" element={<BasicInfoPage />} />
        <Route path="/risk-check" element={<RiskCheckPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
