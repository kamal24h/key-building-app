import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
//import BuildingsPage from './pages/BuildingsPage';
//import Buildings from './pages/Buildings';
import ManagersPage from './pages/ManagersPage';
import UnitsPage from './pages/UnitsPage';
import ResidentsPage from './pages/ResidentsPage';
import CostsPage from './pages/CostsPage';
import BillsPage from './pages/BillsPage';
import ChargesPage from './pages/ChargesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import NotificationsPage from './pages/NotificationsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import AppLayout from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { useAuthStore } from './store/auth-store';
import BuildingsPage from './pages/BuildingsPage';
//import UserTable from './pages/UserTable';
import Buildings1 from './pages/Buildings1';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Buildings1 />

    // <TooltipProvider>
    //   <BrowserRouter>
    //     <Routes>
    //       {/* <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <CostsPage />} /> */}
    //       <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Buildings1 />} />
    //       {/* <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} /> */}
    //       <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
    //       <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
    //       <Route
    //         element={
    //           <ProtectedRoute>
    //             <AppLayout />
    //           </ProtectedRoute>
    //         }
    //       >
    //         <Route path="/dashboard" element={<DashboardPage />} />
            
    //         {/* Property Management Routes */}
    //         <Route
    //           path="/buildings"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin', 'manager']}>
    //               <BuildingsPage />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path="/managers"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin']}>
    //               <ManagersPage />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path="/units"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin', 'manager']}>
    //               <UnitsPage />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path="/residents"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin', 'manager']}>
    //               <ResidentsPage />
    //             </ProtectedRoute>
    //           }
    //         />
            
    //         {/* Financial Routes */}
    //         <Route
    //           path="/costs"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin', 'manager']}>
    //               <CostsPage />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route path="/bills" element={<BillsPage />} />
    //         <Route
    //           path="/charges"
    //           element={
    //             <ProtectedRoute allowedRoles={['admin', 'manager']}>
    //               <ChargesPage />
    //             </ProtectedRoute>
    //           }
    //         />
            
    //         {/* Communication Routes */}
    //         <Route path="/announcements" element={<AnnouncementsPage />} />
    //         <Route path="/notifications" element={<NotificationsPage />} />
    //       </Route>

    //       <Route path="*" element={<NotFoundPage />} />
    //     </Routes>
    //   </BrowserRouter>
    //   <Toaster />
    // </TooltipProvider>
  );
}

export default App;
