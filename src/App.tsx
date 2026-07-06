import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SaaSProvider } from './context/SaaSContext';
import { PrintFlowProvider } from './context/PrintFlowContext';
import { CustomerLayout } from './layouts/CustomerLayout';

// Walk-in Customer Portal Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { UploadingScreen } from './screens/UploadingScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { TrackingScreen } from './screens/TrackingScreen';

// SaaS Marketing & Admin Screens
import { LandingPage } from './screens/saas/LandingPage';
import { FeaturesPage } from './screens/saas/FeaturesPage';
import { PricingPage } from './screens/saas/PricingPage';
import { ContactPage } from './screens/saas/ContactPage';
import { LoginPage } from './screens/saas/LoginPage';
import { RegisterPage } from './screens/saas/RegisterPage';
import { DashboardShell } from './screens/saas/DashboardShell';
import { DashboardOverview } from './screens/saas/DashboardOverview';
import { DashboardQueue } from './screens/saas/DashboardQueue';
import { DashboardShops } from './screens/saas/DashboardShops';
import { DashboardSettings } from './screens/saas/DashboardSettings';
import { DashboardSubscription } from './screens/saas/DashboardSubscription';

export default function App() {
  return (
    <SaaSProvider>
      <PrintFlowProvider>
        <HashRouter>
          <Routes>
            {/* 1. Public SaaS Marketing Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. Protected Owner Console Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardShell />}>
              <Route index element={<DashboardOverview />} />
              <Route path="queue" element={<DashboardQueue />} />
              <Route path="shops" element={<DashboardShops />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="subscription" element={<DashboardSubscription />} />
            </Route>

            {/* 3. Customer Portal Routes - isolated by unique shop slugs */}
            <Route path="/s/:shopSlug" element={<CustomerLayout />}>
              <Route index element={<WelcomeScreen />} />
              <Route path="upload" element={<UploadScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="preview" element={<PreviewScreen />} />
              <Route path="uploading" element={<UploadingScreen />} />
              <Route path="success" element={<SuccessScreen />} />
              <Route path="tracking" element={<TrackingScreen />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </PrintFlowProvider>
    </SaaSProvider>
  );
}
