import { useState, useRef } from 'react';
import { uploadPDF, clearPDF } from '../api/client';

export default function PDFUploader({ pdfState, setPdfState }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('PDF files only.');
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadPDF(file);
      setPdfState(result);
    } catch (err) {
      setError('Upload Failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleClear = async () => {
    try {
      await clearPDF();
      setPdfState(null);
    } catch (err) {
      setError('Failed to clear.');
    }
  };

  if (pdfState) {
    return (
      <div className="bg-brand-surface border-4 border-brand-border p-6 shadow-[8px_8px_0_0_var(--brand-border)] transition-colors">
        <div className="flex justify-between items-start mb-4">
           <h3 className="font-headline font-black text-xl uppercase truncate text-brand-text" title={pdfState.filename}>
              {pdfState.filename}
           </h3>
           <button onClick={handleClear} className="material-symbols-outlined hover:text-brand-error text-brand-text-muted transition-colors">close</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-brand-surface-high border-4 border-brand-border p-4 shadow-[4px_4px_0_0_var(--brand-border)]">
            <span className="block text-4xl font-black font-headline text-brand-primary">{pdfState.pages_indexed || 0}</span>
            <span className="text-[10px] font-black uppercase text-brand-text">Pages Loaded</span>
          </div>
          <div className="bg-brand-surface-high border-4 border-brand-border p-4 shadow-[4px_4px_0_0_var(--brand-border)]">
            <span className="block text-4xl font-black font-headline text-brand-secondary">{pdfState.chunks_created || 0}</span>
            <span className="text-[10px] font-black uppercase text-brand-text">Chunks Indexed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="border-4 border-dashed border-brand-border p-8 text-center bg-brand-surface hover:bg-brand-surface-high transition-colors cursor-pointer group relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {isUploading ? (
        <span className="material-symbols-outlined text-5xl mb-4 text-brand-primary animate-spin">refresh</span>
      ) : (
        <span className="material-symbols-outlined text-5xl mb-4 text-brand-text-muted group-hover:text-brand-primary transition-colors">picture_as_pdf</span>
      )}
      <h3 className="font-headline font-black text-xl uppercase mb-2 text-brand-text">
        {isUploading ? 'INGESTING...' : 'Ingest Clinical Data'}
      </h3>
      <p className="text-sm font-bold text-brand-text-muted uppercase">Drop PDF Clinical Reports here</p>
      <div className="mt-6 flex justify-center">
        <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-4 py-2 font-black text-xs uppercase tracking-tighter">Maximum size 50MB</span>
      </div>
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => handleUpload(e.target.files[0])}
      />
      {error && (
        <div className="absolute top-0 left-0 w-full h-full bg-brand-error flex items-center justify-center text-black font-headline font-black uppercase z-10 border-4 border-brand-border">
          <span className="bg-brand-surface px-4 py-2 text-brand-error border-2 border-brand-border">! {error} !</span>
        </div>
      )}
    </div>
  );
}
