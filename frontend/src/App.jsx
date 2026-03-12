import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ClientsPage from './pages/ClientsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import ExperimentDetail from './pages/ExperimentDetail';
import HospitalDetail from './pages/HospitalDetail';
import AddHospital from './pages/AddHospital';
import CompliancePage from './pages/CompliancePage';
import PermissionsPage from './pages/PermissionsPage';
import SettingsPage from './pages/SettingsPage';
import TestYourDataPage from './pages/TestYourDataPage';
import InboxPage from './pages/InboxPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="experiments" element={<ExperimentsPage />} />
          <Route path="experiments/:id" element={<ExperimentDetail />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<HospitalDetail />} />
          <Route path="clients/add" element={<AddHospital />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="test-your-data" element={<TestYourDataPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="inbox" element={<InboxPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
