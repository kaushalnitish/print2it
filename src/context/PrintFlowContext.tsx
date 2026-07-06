import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrintFile, PrintSettings, OrderState, ShopInfo, UploadStep, TrackingStatus } from '../types';
import { useSaaS } from './SaaSContext';

interface PrintFlowContextType {
  shopInfo: ShopInfo;
  file: PrintFile | null;
  setFile: (file: PrintFile | null) => void;
  settings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  order: OrderState | null;
  setOrder: (order: OrderState | null) => void;
  uploadProgress: number;
  uploadStep: UploadStep;
  isUploading: boolean;
  startUpload: (onComplete: () => void) => void;
  resetFlow: () => void;
  simulateTracking: boolean;
  setSimulateTracking: (simulate: boolean) => void;
}

const defaultSettings: PrintSettings = {
  copies: 1,
  colorMode: 'bw',
  paperSize: 'a4',
  sideMode: 'single',
};

const defaultShop: ShopInfo = {
  name: 'PrintFlow Hub',
  tagline: 'Frictionless, contact-free instant printing.',
  logo: 'Printer',
  address: '427 University Avenue, Palo Alto, CA',
  phone: '(650) 555-0192',
};

const PrintFlowContext = createContext<PrintFlowContextType | undefined>(undefined);

export function PrintFlowProvider({ children }: { children: React.ReactNode }) {
  const [shopInfo, setShopInfo] = useState<ShopInfo>(defaultShop);
  const [file, setFile] = useState<PrintFile | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<UploadStep>('preparing');
  const [isUploading, setIsUploading] = useState(false);
  const [simulateTracking, setSimulateTracking] = useState(true);

  const { getShopBySlug, addJobToShop, updateJobStatus } = useSaaS();

  // Multi-tenant resolver: Sync shop info based on the current URL path slug (e.g. /s/quickprint)
  useEffect(() => {
    const resolveShop = () => {
      const match = window.location.hash.match(/\/s\/([^/]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const tenant = getShopBySlug(slug);
        if (tenant) {
          setShopInfo({
            name: tenant.shopName,
            tagline: `Premium high-speed printing at ${tenant.shopName}.`,
            logo: 'Printer',
            address: tenant.address,
            phone: tenant.phone,
          });
        }
      }
    };

    resolveShop();

    // Listen for hash changes
    window.addEventListener('hashchange', resolveShop);
    return () => window.removeEventListener('hashchange', resolveShop);
  }, [getShopBySlug]);

  // Legacy search param query backup check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantName = params.get('tenant') || params.get('shop');
    if (tenantName && !window.location.hash.includes('/s/')) {
      const formattedName = decodeURIComponent(tenantName).trim();
      setShopInfo((prev) => ({
        ...prev,
        name: formattedName,
        tagline: `Premium high-speed printing at ${formattedName}.`,
      }));
    }
  }, []);

  const updateSettings = (newSettings: Partial<PrintSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetFlow = () => {
    setFile(null);
    setSettings(defaultSettings);
    setOrder(null);
    setUploadProgress(0);
    setUploadStep('preparing');
    setIsUploading(false);
  };

  const startUpload = (onComplete: () => void) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep('preparing');

    const totalDuration = 5000; // 5 seconds
    const intervalTime = 100;
    const increment = 100 / (totalDuration / intervalTime);
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress = Math.min(currentProgress + increment, 100);
      setUploadProgress(currentProgress);

      if (currentProgress < 15) {
        setUploadStep('preparing');
      } else if (currentProgress < 65) {
        setUploadStep('uploading');
      } else if (currentProgress < 85) {
        setUploadStep('processing');
      } else {
        setUploadStep('finalizing');
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        setIsUploading(false);

        // Generate simulated Order details
        const randomToken = `PF-${Math.floor(1000 + Math.random() * 9000)}`;
        const initialQueue = Math.floor(2 + Math.random() * 4); // 2 to 5
        const waitMin = initialQueue * 2; // 2 mins per job

        const newOrder: OrderState = {
          token: randomToken,
          queuePosition: initialQueue,
          estimatedWaitMinutes: waitMin,
          status: 'submitted',
          file: file,
          settings: settings,
        };

        // Add to global SaaS print job database so shop owners can see it instantly
        const match = window.location.hash.match(/\/s\/([^/]+)/);
        if (match && match[1]) {
          const slug = match[1];
          const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
          };

          addJobToShop(slug, {
            token: randomToken,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            pages: file.pages,
            copies: settings.copies,
            colorMode: settings.colorMode,
            paperSize: settings.paperSize,
            sideMode: settings.sideMode,
            status: 'submitted',
          });
        }

        setOrder(newOrder);
        onComplete();
      }
    }, intervalTime);
  };

  // Live order status simulation for Screen 7 (Tracking)
  useEffect(() => {
    if (!order || order.status === 'ready' || !simulateTracking) return;

    const timer = setTimeout(() => {
      setOrder((prevOrder) => {
        if (!prevOrder) return null;

        let nextStatus: TrackingStatus = prevOrder.status;
        let nextQueue = prevOrder.queuePosition;
        let nextWait = prevOrder.estimatedWaitMinutes;

        if (prevOrder.status === 'submitted') {
          nextStatus = 'waiting';
          nextQueue = Math.max(1, prevOrder.queuePosition - 1);
          nextWait = Math.max(2, prevOrder.estimatedWaitMinutes - 2);
        } else if (prevOrder.status === 'waiting') {
          if (prevOrder.queuePosition > 1) {
            nextQueue = prevOrder.queuePosition - 1;
            nextWait = Math.max(2, prevOrder.estimatedWaitMinutes - 2);
          } else {
            nextStatus = 'printing';
            nextQueue = 1;
            nextWait = 1;
          }
        } else if (prevOrder.status === 'printing') {
          nextStatus = 'ready';
          nextQueue = 0;
          nextWait = 0;
        }

        // Sync status back to global SaaS database for dynamic owner dashboard feedback
        const match = window.location.hash.match(/\/s\/([^/]+)/);
        if (match && match[1]) {
          const slug = match[1];
          const tenant = getShopBySlug(slug);
          if (tenant) {
            const activeJob = tenant.printJobs.find((j) => j.token === prevOrder.token);
            if (activeJob) {
              updateJobStatus(tenant.shopId, activeJob.id, nextStatus);
            }
          }
        }

        return {
          ...prevOrder,
          status: nextStatus,
          queuePosition: nextQueue,
          estimatedWaitMinutes: nextWait,
        };
      });
    }, 8000); // Progresses status every 8 seconds for nice user feedback

    return () => clearTimeout(timer);
  }, [order, simulateTracking, getShopBySlug, updateJobStatus]);

  return (
    <PrintFlowContext.Provider
      value={{
        shopInfo,
        file,
        setFile,
        settings,
        updateSettings,
        order,
        setOrder,
        uploadProgress,
        uploadStep,
        isUploading,
        startUpload,
        resetFlow,
        simulateTracking,
        setSimulateTracking,
      }}
    >
      {children}
    </PrintFlowContext.Provider>
  );
}

export function usePrintFlow() {
  const context = useContext(PrintFlowContext);
  if (!context) {
    throw new Error('usePrintFlow must be used within a PrintFlowProvider');
  }
  return context;
}
