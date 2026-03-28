export default function TypingIndicator() {
  return (
    <div className="flex justify-start mr-12 mb-6">
      <div className="bg-white border-4 border-on-surface p-6 neo-brutal-shadow-sm max-w-[200px] relative overflow-hidden flex items-center justify-center gap-2">
        <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400"></div>
        <span className="text-zinc-400 material-symbols-outlined animate-spin text-3xl">psychology</span>
        <span className="font-headline font-black uppercase text-sm tracking-widest text-zinc-800">Inferring</span>
      </div>
    </div>
  );
}
