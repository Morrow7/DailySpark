'use client'
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/request";
import { getToken } from "@/lib/clientAuth";
import { Search, Upload, Volume2, Star } from "lucide-react";
import WordDetailModal, { Word } from "@/components/WordDetailModal";

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/words");
      setWords(data);
    } catch (e: any) {
      setError(e.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return words;
    const s = q.toLowerCase();
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(s) ||
        w.meanings?.some((m) => m.definition.toLowerCase().includes(s)) ||
        w.meaning?.toLowerCase().includes(s)
    );
  }, [q, words]);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = getToken();
      const res = await fetch("/api/words/import", {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "导入失败");
      await load();
      alert(`导入完成：成功 ${data.imported}，重复 ${data.duplicates}，失败 ${data.failed}`);
    } catch (e: any) {
      setError(e.message || "导入失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 mb-24 md:mb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-cheese-title mb-2 tracking-tight">Vocabulary</h1>
          <p className="text-gray-500 font-medium">
            Master your words, one slice at a time 🧀
            <span className="ml-2 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
              {words.length} Words
            </span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 cheese-btn-primary cursor-pointer active:scale-95 select-none">
            {uploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
                <Upload size={18} strokeWidth={3} />
            )}
            Import Words
            <input type="file" onChange={onImport} accept=".xlsx,.xls,.csv,.json" className="hidden" />
            </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-2 z-20 mb-8 px-1">
        <div className="relative group max-w-2xl mx-auto md:mx-0 shadow-sm rounded-2xl">
          <div className="absolute left-5 top-4 text-gray-400 group-focus-within:text-yellow-500 transition-colors">
            <Search size={22} strokeWidth={2.5} />
          </div>
          <input
            placeholder="Search for a word..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-gray-700 placeholder:text-gray-300 font-bold text-lg shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 font-bold text-sm py-4 px-6 rounded-2xl flex items-center mb-8 border-2 border-red-100 animate-pulse">
          <span className="mr-2 text-xl">⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-40 bg-white rounded-[24px] animate-pulse border-2 border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((w: any) => (
            <div
              key={w.id}
              onClick={() => {
                setSelectedWord(w);
                setModalVisible(true);
              }}
              className="cheese-card relative p-5 cursor-pointer group flex flex-col h-full min-h-[160px]"
            >
              {/* Top Row: Word & Sound */}
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight leading-tight group-hover:text-yellow-600 transition-colors">
                  {w.word}
                </h3>
                <button 
                  className="p-2 -mr-2 -mt-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); /* play sound */ }}
                >
                  <Volume2 size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Phonetic & Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                 <span className="text-sm font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                   {w.phonetic_us || w.phonetic_uk || '/.../'}
                 </span>
                 {w.partOfSpeech && (
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-blue-100">
                      {w.partOfSpeech}
                    </span>
                 )}
              </div>

              {/* Divider */}
              <div className="h-0.5 w-10 bg-gray-100 rounded-full mb-3 group-hover:w-full group-hover:bg-yellow-200 transition-all duration-300" />

              {/* Meaning (Bottom) */}
              <div className="mt-auto">
                <p className="text-base font-bold text-gray-600 line-clamp-2 leading-snug">
                  {w.meanings?.[0]?.definition || w.meaning || "No definition"}
                </p>
              </div>
              
              {/* Decorative Circle */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
            </div>
          ))}
          
          {filtered.length === 0 && !loading && (
             <div className="col-span-full flex flex-col items-center justify-center py-32 text-gray-400">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 animate-float">
                    <Search size={40} className="text-yellow-300" strokeWidth={3} />
                </div>
                <p className="font-bold text-lg text-gray-300">No words found matching "{q}"</p>
             </div>
          )}
        </div>
      )}
      
      <WordDetailModal 
        visible={modalVisible} 
        word={selectedWord} 
        onClose={() => setModalVisible(false)} 
        onToggleFavorite={(w) => {
           alert('Added to favorites (Mock)');
        }}
      />
    </div>
  );
}
