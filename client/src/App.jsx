import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import CreatePage from './pages/CreatePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import GeneratingPage from './pages/GeneratingPage.jsx';
import CaseOverviewPage from './pages/CaseOverviewPage.jsx';
import EvidencePage from './pages/EvidencePage.jsx';
import SuspectsPage from './pages/SuspectsPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import InvestigationListPage from './pages/InvestigationListPage.jsx';
import AccusationPage from './pages/AccusationPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/create" element={<CreatePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/generating/:id" element={<GeneratingPage />} />
    <Route path="/case/:id" element={<CaseOverviewPage />} />
    <Route path="/case/:id/evidence" element={<EvidencePage />} />
    <Route path="/case/:id/suspects" element={<SuspectsPage />} />
    <Route path="/case/:id/timeline" element={<TimelinePage />} />
    <Route path="/case/:id/notes" element={<NotesPage />} />
    <Route path="/case/:id/accuse" element={<AccusationPage />} />
    <Route path="/case/:id/result" element={<ResultPage />} />
    <Route path="/dashboard" element={<InvestigationListPage />} />
    <Route path="/history" element={<InvestigationListPage />} />
    <Route path="*" element={<LandingPage />} />
  </Routes></AuthProvider>;
}
