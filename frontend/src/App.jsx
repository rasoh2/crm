import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OpportunityList from './components/opportunities/OpportunityList';
import OpportunityForm from './components/opportunities/OpportunityForm';
import OpportunityDetail from './components/opportunities/OpportunityDetail';
import AIChatBox from './components/chat/AIChatBox';
import PipelineDashboard from './components/dashboard/PipelineDashboard';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública de Inicio de Sesión */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas que requieren Autenticación JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<OpportunityList />} />
            <Route path="dashboard" element={<PipelineDashboard />} />
            <Route path="opportunity/new" element={<OpportunityForm />} />
            <Route path="opportunity/:id" element={<OpportunityDetail />} />
            <Route path="opportunity/:id/edit" element={<OpportunityForm />} />
            <Route path="chat" element={<AIChatBox />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
