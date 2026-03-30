import { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import PDFUploader from './components/PDFUploader';
import { checkHealth, sendMessage } from './api/client';
import { STAMP, CLACK } from './animations/physics';

/** Generate a stable unique ID for each message */
const genId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfState, setPdfState] = useState(null);

  const mainControls = useAnimationControls();

  // Apply Dark Mode Class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Server Polling
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await checkHealth();
        setIsOnline(res.status === 'ok');
        if (res.pdf_loaded) {
          setPdfState({
            filename: res.pdf_filename,
            pages_indexed: '?',
            chunks_created: '?'
          });
        }
      } catch (e) {
        setIsOnline(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = async (newTheme) => {
    // Fire a mechanical clack on the main container
    mainControls.start({
      scale: [1, 0.98, 1],
      transition: CLACK,
    });
    setTheme(newTheme);
  };

  const handleSend = async (messageText, imageFile, imagePreview) => {
    const userMessage = {
      id: genId(),
      role: 'user',
      content: messageText,
      imagePreview: imagePreview
    };

    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const cleanHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await sendMessage(messageText, cleanHistory, imageFile);

      const assistantMessage = {
        id: genId(),
        role: 'assistant',
        content: res.response,
        citations: res.citations || [],
        inferenceTime: res.inference_time_ms,
        tokensGenerated: res.tokens_generated,
        tokensPerSecond: res.tokens_per_second
      };

      setHistory(prev => [...prev, assistantMessage]);
    } catch (e) {
      setHistory(prev => [...prev, {
        id: genId(),
        role: 'assistant',
        content: "⚠️ Connection Error: Failed to reach the MedGemma backend.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      animate={mainControls}
      className="bg-brand-bg text-brand-text h-screen overflow-hidden"
    >
      <Header isOnline={isOnline} theme={theme} setTheme={handleThemeChange} />
      <Sidebar />

      <main className="md:ml-72 mt-16 p-4 h-[calc(100vh-4rem)] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-full">

          {/* Header Area */}
          <div className="col-span-12 flex justify-between items-center mb-2 border-b-4 border-brand-border pb-3">
            <div>
              <motion.h1
                className="text-3xl font-black font-headline uppercase leading-none mb-1"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ ...STAMP, delay: 0 }}
              >
                Patient Analysis
              </motion.h1>
              <div className="flex gap-3 items-center mt-1">
                <span className="bg-brand-surface-high border-2 border-brand-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-text">Case ID: 4882-QX</span>
                <span className="text-brand-text-muted font-bold uppercase text-xs">Priority: High Alpha</span>
              </div>
            </div>
            <div className="hidden lg:flex gap-3">
              <button className="bg-brand-surface border-4 border-brand-border px-4 py-2 font-headline font-bold uppercase text-sm neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-brand-text">Export Report</button>
              <button className="bg-brand-primary border-4 border-brand-border px-4 py-2 font-headline font-black uppercase text-sm text-black neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">New Diagnostic</button>
            </div>
          </div>

          {/* Left Column (Upload only) */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <PDFUploader pdfState={pdfState} setPdfState={setPdfState} theme={theme} />
          </div>

          {/* Right Column (Chat feed + Input) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col relative h-[calc(100vh-14rem)] border-l-4 border-brand-border pl-6 transition-colors">
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-4">
              <ChatWindow
                history={history}
                isLoading={isLoading}
                onSuggestionSelect={(text) => handleSend(text, null, null)}
                theme={theme}
              />
            </div>
            <div className="pt-2 bg-brand-bg w-full z-10 shrink-0 border-t-4 border-brand-border mt-2 transition-colors">
              <InputBar onSend={handleSend} disabled={isLoading} theme={theme} />
            </div>
          </div>

        </div>
      </main>
    </motion.div>
  );
}
