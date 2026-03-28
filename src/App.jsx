import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import PDFUploader from './components/PDFUploader';
import { checkHealth, sendMessage } from './api/client';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfState, setPdfState] = useState(null);

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

  const handleSend = async (messageText, imageFile, imagePreview) => {
    const userMessage = {
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
        role: 'assistant',
        content: "⚠️ Connection Error: Failed to reach the MedGemma backend.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen transition-colors duration-300">
      <Header isOnline={isOnline} theme={theme} setTheme={setTheme} />
      <Sidebar />
      
      <main className="md:ml-72 mt-16 p-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 h-full">
          
          {/* Header Area */}
          <div className="col-span-12 flex justify-between items-end mb-4 border-b-4 border-brand-border pb-6">
            <div>
              <h1 className="text-5xl font-black font-headline uppercase leading-none mb-2">Patient Analysis</h1>
              <div className="flex gap-4 items-center mt-4">
                <span className="bg-brand-surface-high border-2 border-brand-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-text">Case ID: 4882-QX</span>
                <span className="text-brand-text-muted font-bold uppercase text-xs">Priority: High Alpha</span>
              </div>
            </div>
            <div className="hidden lg:flex gap-4">
              <button className="bg-brand-surface border-4 border-brand-border px-6 py-3 font-headline font-bold uppercase neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-brand-text">Export Report</button>
              <button className="bg-brand-primary border-4 border-brand-border px-6 py-3 font-headline font-black uppercase text-black neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">New Diagnostic</button>
            </div>
          </div>

          {/* Left Column (Upload only, mocked data removed) */}
          <div className="col-span-12 lg:col-span-3 space-y-8">
            <PDFUploader pdfState={pdfState} setPdfState={setPdfState} />
          </div>

          {/* Right Column (Chat feed + Input) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col relative h-[calc(100vh-16rem)] border-l-4 border-brand-border pl-8 transition-colors">
             <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">
               <ChatWindow 
                  history={history} 
                  isLoading={isLoading} 
                  onSuggestionSelect={(text) => handleSend(text, null, null)}
               />
             </div>
             <div className="pt-4 bg-brand-bg w-full z-10 shrink-0 border-t-4 border-brand-border mt-4 transition-colors">
               <InputBar onSend={handleSend} disabled={isLoading} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
