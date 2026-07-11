import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SaaSProvider } from './context/SaaSContext';
import { PrintFlowProvider } from './context/PrintFlowContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { isSupabaseConfigured } from './lib/supabase';
import { AlertCircle } from 'lucide-react';

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
import { DashboardAgent } from './screens/saas/DashboardAgent';

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-950 tracking-tight">Cloud connection unavailable.</h1>
            <p className="text-slate-550 font-medium text-xs leading-relaxed">
              We are unable to establish a secure database channel. Please verify your system's deployment environment secrets.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              <Route path="agent" element={<DashboardAgent />} />
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
