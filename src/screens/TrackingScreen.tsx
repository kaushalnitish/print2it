import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, CheckCircle2, Clock, Printer, ShoppingBag, Phone, Plus, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { TrackingStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const TrackingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, resetFlow, simulateTracking, setSimulateTracking } = usePrintFlow();

  // If no active order, send to home
  useEffect(() => {
    if (!order) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/`);
    }
  }, [order, navigate, location.pathname]);

  if (!order) return null;

  // Timeline stages
  const stages: { status: TrackingStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'submitted',
      label: 'Submitted',
      desc: 'Document received securely',
      icon: CheckCircle2,
    },
    {
      status: 'waiting',
      label: 'In Queue',
      desc: 'Waiting for prior print jobs',
      icon: Clock,
    },
    {
      status: 'printing',
      label: 'Printing',
      desc: 'Actively processing in tray',
      icon: Printer,
    },
    {
      status: 'ready',
      label: 'Ready for Pickup',
      desc: 'Finished and ready for collection',
      icon: ShoppingBag,
    },
  ];

  // Helper to find index of current status
  const currentIdx = stages.findIndex((s) => s.status === order.status);

  // Status message mapping helper
  const getInstructionCard = () => {
    switch (order.status) {
      case 'submitted':
        return {
          title: 'Document Transmitted',
          desc: 'We have received your print job. It is safely registered in the database, and the operator is reviewing the specs.',
          bgColor: 'bg-indigo-50 border-indigo-150',
          textColor: 'text-indigo-950',
        };
      case 'waiting':
        return {
          title: `Position #${order.queuePosition} in Queue`,
          desc: `Your job is in the active shop queue. Estimated wait is ~${order.estimatedWaitMinutes} minutes. You can relax; we will notify you on this screen the instant it begins printing.`,
          bgColor: 'bg-amber-50/80 border-amber-200/60',
          textColor: 'text-amber-950',
        };
      case 'printing':
        return {
          title: 'Printing Document Now',
          desc: 'Your file is traveling through the paper rollers at the shop counter! It will take less than 60 seconds to finish. Please step near the counter.',
          bgColor: 'bg-blue-50/80 border-blue-200/60',
          textColor: 'text-blue-950',
        };
      case 'ready':
        return {
          title: 'Pick Up at Counter!',
          desc: `Success! Your printed pages are ready. Please approach the service desk and show your receipt token: ${order.token} to receive your copies.`,
          bgColor: 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/5',
          textColor: 'text-emerald-950',
        };
    }
  };

  const instruction = getInstructionCard();

  const handlePrintAnother = () => {
    resetFlow();
    const match = location.pathname.match(/(\/s\/[^/]+)/);
    const prefix = match ? match[1] : '';
    navigate(`${prefix}/`);
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      
      <div className="space-y-6">
        {/* Title and Top Header info */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Print Tracker</h2>
            <p className="text-slate-500 text-base mt-1 font-medium">Watch your print status in real-time.</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Dynamic Status Notification Alert */}
        <AnimatePresence mode="wait">
          <motion.div
            key={order.status}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-5 rounded-3xl border flex gap-4 ${instruction.bgColor}`}
            id="tracking-instruction-card"
          >
            {order.status === 'ready' ? (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
            ) : order.status === 'printing' ? (
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shrink-0 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1.5 flex-1 text-sm md:text-base">
              <p className={`font-black text-lg ${instruction.textColor}`}>{instruction.title}</p>
              <p className="text-slate-600 leading-relaxed font-medium">{instruction.desc}</p>
              {order.status === 'ready' && (
                <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono font-extrabold text-lg shadow-sm">
                  <span>Token:</span>
                  <span className="text-amber-400">{order.token}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Timeline graphics container */}
        <Card className="p-6 md:p-8" id="tracking-timeline-card" animateEntrance={true} delay={0.1}>
          <div className="space-y-8 relative">
            
            {/* Background line behind steps */}
            <div className="absolute left-6.5 top-3 bottom-3 w-1 bg-slate-100 rounded-full" />
            
            {/* Active filled progress line */}
            <motion.div
              className="absolute left-6.5 top-3 w-1 bg-slate-900 rounded-full origin-top"
              initial={{ height: 0 }}
              animate={{ height: `${(currentIdx / (stages.length - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {stages.map((stage, idx) => {
              const isPassed = idx < currentIdx;
              const isActive = idx === currentIdx;
              const isUpcoming = idx > currentIdx;
              const StageIcon = stage.icon;

              return (
                <div key={stage.status} className="flex items-start gap-5 relative select-none">
                  {/* Step Indicator Dot */}
                  <div className="relative shrink-0 z-10">
                    {isPassed ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-full bg-slate-900 border-4 border-white text-white flex items-center justify-center shadow-md"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 0px rgba(15,23,42,0.1)', '0 0 0 8px rgba(15,23,42,0.06)', '0 0 0 0px rgba(15,23,42,0.1)'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-14 h-14 rounded-full bg-white border-4 border-slate-900 text-slate-900 flex items-center justify-center shadow-md"
                      >
                        <StageIcon className="w-6 h-6 shrink-0 text-slate-900 animate-pulse" />
                      </motion.div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-100 text-slate-350 flex items-center justify-center shadow-sm">
                        <StageIcon className="w-6 h-6 shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Stage Text Content */}
                  <div className="pt-2">
                    <p className={`font-black text-lg ${
                      isActive 
                        ? 'text-slate-900' 
                        : isPassed 
                          ? 'text-slate-500 font-bold' 
                          : 'text-slate-400 font-medium'
                    }`}>
                      {stage.label}
                    </p>
                    <p className={`text-sm mt-0.5 font-medium ${
                      isActive 
                        ? 'text-slate-500 font-semibold' 
                        : isPassed 
                          ? 'text-slate-450' 
                          : 'text-slate-350'
                    }`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Queue progression simulator toggle (For preview testing) */}
        <Card className="p-4 bg-slate-50/60 border border-slate-100 flex items-center justify-between" id="simulator-toggle-card">
          <div className="flex items-center gap-2.5">
            <RefreshCw className={`w-5 h-5 text-slate-500 ${simulateTracking && order.status !== 'ready' ? 'animate-spin' : ''}`} />
            <div>
              <p className="font-bold text-slate-800 text-sm">Demo Auto-Progression</p>
              <p className="text-slate-400 text-xs font-semibold">Simulates order completion steps (8s interval)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulateTracking(!simulateTracking)}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 outline-none ${
              simulateTracking ? 'bg-slate-900' : 'bg-slate-200'
            }`}
            id="simulation-toggle-switch"
            aria-label="Toggle simulation auto progression"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                simulateTracking ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </Card>
      </div>

      {/* Solid Print Another Action */}
      <div className="mt-8">
        <Button
          id="print-another-doc-btn"
          variant="secondary"
          onClick={handlePrintAnother}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Print Another Document
        </Button>
      </div>
    </div>
  );
};
