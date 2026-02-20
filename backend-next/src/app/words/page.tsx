'use client'
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/request";
import { getToken } from "@/lib/clientAuth";

type Word = {
  id: number;
  word: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  createdAt: string;
  meanings?: { definition: string; language: string }[];
};

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        w.meanings?.some((m) => m.definition.toLowerCase().includes(s))
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
    <div style={{ maxWidth: 980, margin: "16px auto 100px", padding: "0 12px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>单词</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="搜索单词或释义"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 12px",
            borderRadius: 10,
            background: "#ff7aa2",
            color: "#fff",
            cursor: "pointer",
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? "导入中..." : "导入文件"}
          <input type="file" onChange={onImport} accept=".xlsx,.xls,.csv,.json" style={{ display: "none" }} />
        </label>
      </div>
      {error && <div style={{ color: "#d00", marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>加载中...</div>
      ) : (
        <ul style={{ display: "grid", gap: 8 }}>
          {filtered.map((w) => (
            <li
              key={w.id}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{w.word}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {w.meanings?.[0]?.definition || ""}
                </div>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(w.createdAt).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
