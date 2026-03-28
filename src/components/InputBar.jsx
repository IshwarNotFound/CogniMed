import { useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if ((!input.trim() && !imageFile) || disabled) return;
    onSend(input, imageFile, imagePreview);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full relative">
      <div className="bg-brand-surface border-4 border-brand-border p-2 neo-brutal-shadow flex flex-col sm:flex-row items-center gap-4 relative w-full transition-colors">
        
        {imagePreview && (
          <div className="absolute top-0 left-0 -translate-y-[calc(100%+16px)] w-32 h-32 bg-brand-surface border-4 border-brand-border neo-brutal-shadow group z-50">
             <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
             <button 
              onClick={removeImage}
              className="absolute -top-3 -right-3 bg-brand-error text-white p-1 border-2 border-brand-border shadow-[2px_2px_0_0_var(--brand-border)] hover:scale-110 transition-transform"
             >
               <X className="w-5 h-5" strokeWidth={3} />
             </button>
          </div>
        )}

        <button 
          className="material-symbols-outlined p-4 text-brand-text-muted hover:text-brand-text shrink-0 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          attach_file
        </button>
        <input 
          type="file" 
          accept="image/jpeg, image/png" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        <input 
          className="flex-1 bg-transparent border-none focus:ring-0 font-headline font-black text-xl text-brand-text placeholder:text-brand-text-muted uppercase py-4 outline-none w-full" 
          placeholder={imageFile ? "IMAGE ATTACHED. ADD QUERY..." : "QUERY CLINICAL INTELLIGENCE..."} 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button 
          onClick={handleSend}
          disabled={(!input.trim() && !imageFile) || disabled}
          className="w-full sm:w-auto bg-brand-primary text-black border-4 border-brand-border px-8 py-4 font-headline font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0_0_var(--brand-border)] neo-brutal-shadow"
        >
          Process <span className="material-symbols-outlined shrink-0 text-black">bolt</span>
        </button>
      </div>
    </div>
  );
}
