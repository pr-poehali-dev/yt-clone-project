import { useState } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ThumbnailGeneratorProps {
  onSelect: (url: string) => void;
}

const suggestions = [
  "Топ-10 лайфхаков для продуктивности, офис, неон",
  "Путешествие в горы, закат, кинематограф",
  "Обзор нового iPhone, студия, яркий фон",
  "Кулинария, вкусная еда крупным планом",
  "Игровой стрим, неоновый свет, экшн",
  "Финансы и инвестиции, деньги, успех",
];

export default function ThumbnailGenerator({ onSelect }: ThumbnailGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<string[]>([]);

  const generate = async (p?: string) => {
    const text = (p || prompt).trim();
    if (!text) return;
    setError("");
    setLoading(true);
    try {
      const result = await api.generateThumbnail(text);
      setGenerated(prev => [result.url, ...prev].slice(0, 6));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
          <Icon name="Sparkles" size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm">ИИ-генератор обложек</h3>
          <p className="text-xs text-muted-foreground">Опиши идею — FLUX создаст обложку</p>
        </div>
      </div>

      {/* Prompt input */}
      <div className="flex gap-2 mb-3">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="Опиши обложку для видео..."
          className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={() => generate()}
          disabled={loading || !prompt.trim()}
          className="gradient-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 neon-glow flex items-center gap-2"
        >
          {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Wand2" size={16} />}
          {loading ? "Генерирую..." : "Создать"}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-2 flex-wrap mb-4">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(s); generate(s); }}
            disabled={loading}
            className="text-xs px-3 py-1 bg-secondary hover:bg-border rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {s.split(",")[0]}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2 mb-3">
          <Icon name="AlertCircle" size={14} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="aspect-video w-full rounded-xl shimmer mb-3" />
      )}

      {/* Generated images */}
      {generated.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {generated.map((url, i) => (
            <div
              key={i}
              className="relative group cursor-pointer rounded-xl overflow-hidden aspect-video border-2 border-transparent hover:border-primary transition-all"
              onClick={() => onSelect(url)}
            >
              <img src={url} alt="Обложка" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="gradient-primary text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Icon name="Check" size={12} />
                  Выбрать
                </div>
              </div>
              {i === 0 && (
                <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Новое
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
