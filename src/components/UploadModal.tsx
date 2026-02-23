import { useState } from "react";
import Icon from "@/components/ui/icon";
import ThumbnailGenerator from "@/components/ThumbnailGenerator";
import { api } from "@/lib/api";

const CATEGORIES = ["Технологии", "Путешествия", "Кулинария", "Финансы", "Саморазвитие", "Игры", "Музыка", "Спорт", "Юмор", "Другое"];

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Технологии");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"info" | "thumbnail">("info");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setError("");
    setLoading(true);
    try {
      await api.uploadVideo(title, description, thumbnail, category);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass rounded-2xl border border-border animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Upload" size={16} className="text-white" />
            </div>
            <h2 className="font-bold">Загрузить видео</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("info")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${step === "info" ? "gradient-primary text-white" : "text-muted-foreground"}`}
            >
              1. Инфо
            </button>
            <button
              onClick={() => setStep("thumbnail")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${step === "thumbnail" ? "gradient-primary text-white" : "text-muted-foreground"}`}
            >
              2. Обложка
            </button>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === "info" && (
            <form onSubmit={e => { e.preventDefault(); setStep("thumbnail"); }} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Название видео *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Придумай цепляющее название..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Расскажи о чём видео..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Категория</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat ? "gradient-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full gradient-primary text-white rounded-xl py-3 font-bold text-sm neon-glow hover:opacity-90">
                Далее: выбрать обложку →
              </button>
            </form>
          )}

          {step === "thumbnail" && (
            <div className="space-y-4">
              {thumbnail && (
                <div className="relative rounded-xl overflow-hidden aspect-video mb-2 border-2 border-primary">
                  <img src={thumbnail} alt="Обложка" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Icon name="Check" size={10} />
                    Выбрано
                  </div>
                </div>
              )}

              <ThumbnailGenerator onSelect={url => setThumbnail(url)} />

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("info")} className="flex-1 bg-secondary text-foreground rounded-xl py-3 font-bold text-sm hover:bg-border transition-colors">
                  ← Назад
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !title}
                  className="flex-1 gradient-primary text-white rounded-xl py-3 font-bold text-sm neon-glow hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><Icon name="Loader2" size={16} className="animate-spin" />Публикуем...</> : "Опубликовать видео"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
