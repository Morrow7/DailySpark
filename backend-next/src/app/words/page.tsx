'use client'
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/request";
import { getToken } from "@/lib/clientAuth";
import { Search, Upload, Plus, Volume2 } from "lucide-react";
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Vocabulary</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Manage your personal dictionary • {words.length} words</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-2xl shadow-lg shadow-pink-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-bold active:scale-95">
            {uploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
                <Upload size={18} />
            )}
            Import Words
            <input type="file" onChange={onImport} accept=".xlsx,.xls,.csv,.json" className="hidden" />
            </label>
        </div>
      </div>

      <div className="sticky top-0 md:top-4 z-10 bg-white/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 mb-6 md:rounded-2xl md:shadow-sm transition-all">
        <div className="relative group max-w-2xl">
          <div className="absolute left-5 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            placeholder="Search word, meaning or tag..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-700 placeholder:text-gray-400 shadow-sm font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm py-3 px-4 rounded-xl flex items-center mb-6 border border-red-100 animate-pulse">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((w: any) => (
            <div
              key={w.id}
              onClick={() => {
                setSelectedWord(w);
                setModalVisible(true);
              }}
              className="group bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />
              
              <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">{w.word}</span>
                    <button className="p-2 -mr-2 -mt-2 rounded-full text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors z-10" onClick={(e) => { e.stopPropagation(); /* play sound */ }}>
                        <Volume2 size={18} />
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {w.partOfSpeech && (
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                        {w.partOfSpeech}
                        </span>
                    )}
                    {w.level && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                        {w.level}
                        </span>
                    )}
                </div>

                <div className="text-sm text-gray-500 line-clamp-2 font-medium leading-relaxed">
                  {w.meanings?.[0]?.definition || w.meaning || "No definition available"}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
             <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-300" />
                </div>
                <p className="font-medium">No words found matching "{q}"</p>
             </div>
          )}
        </div>
      )}

      
      <WordDetailModal 
        visible={modalVisible} 
        word={selectedWord} 
        onClose={() => setModalVisible(false)} 
        onToggleFavorite={(w) => {
           // Implement toggle favorite
           alert('Added to favorites (Mock)');
        }}
      />
    </div>
  );
}
