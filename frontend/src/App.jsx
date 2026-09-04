import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OpportunityList from './components/opportunities/OpportunityList';
import OpportunityForm from './components/opportunities/OpportunityForm';
import OpportunityDetail from './components/opportunities/OpportunityDetail';
import AIChatBox from './components/chat/AIChatBox';

import PipelineDashboard from './components/dashboard/PipelineDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<OpportunityList />} />
          <Route path="dashboard" element={<PipelineDashboard />} />
          <Route path="opportunity/new" element={<OpportunityForm />} />
          <Route path="opportunity/:id" element={<OpportunityDetail />} />
          <Route path="opportunity/:id/edit" element={<OpportunityForm />} />
          <Route path="chat" element={<AIChatBox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
