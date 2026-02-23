import { useState } from "react";
import Icon from "@/components/ui/icon";

type Mode = "login" | "register";

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, username: string, displayName: string) => Promise<void>;
}

export default function AuthModal({ onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, username, displayName || username);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl p-8 border border-border animate-scale-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center neon-glow">
            <Icon name="Play" size={20} className="text-white ml-1" />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ViewWave
          </span>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">
          {mode === "login" ? "Добро пожаловать!" : "Создай аккаунт"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "login" ? "Войди, чтобы смотреть и создавать" : "Смотри, создавай и зарабатывай"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя пользователя</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  placeholder="myusername"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Отображаемое имя</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Твоё имя"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white rounded-xl py-3 font-bold text-sm neon-glow hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" />
                {mode === "login" ? "Входим..." : "Регистрируемся..."}
              </span>
            ) : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          </span>
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-sm text-primary font-semibold hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="X" size={18} />
        </button>
      </div>
    </div>
  );
}
