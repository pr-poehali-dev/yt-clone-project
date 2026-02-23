import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";
import { User } from "@/lib/api";
import { formatMoney } from "@/data/videos";

interface DashboardData {
  channel: {
    id: string;
    name: string;
    description: string;
    subscribers: number;
    total_views: number;
    total_earnings: number;
  };
  earnings_by_source: Record<string, number>;
  monthly_earnings: { month: string; amount: number }[];
  videos: {
    id: string;
    title: string;
    thumbnail_url: string;
    views: number;
    likes: number;
    comments: number;
    earnings: number;
    created_at: string;
  }[];
  new_subscribers_30d: number;
}

interface AuthorDashboardProps {
  user: User;
  onClose: () => void;
  onBecomeAuthor: (name: string, desc: string) => Promise<void>;
}

export default function AuthorDashboard({ user, onClose, onBecomeAuthor }: AuthorDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBecomeAuthor, setShowBecomeAuthor] = useState(false);
  const [channelName, setChannelName] = useState(user.display_name || user.username);
  const [channelDesc, setChannelDesc] = useState("");
  const [becomingAuthor, setBecomingAuthor] = useState(false);

  useEffect(() => {
    if (!user.is_author) { setLoading(false); return; }
    api.getDashboardStats()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user.is_author]);

  const handleBecomeAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBecomingAuthor(true);
    try {
      await onBecomeAuthor(channelName, channelDesc);
      setShowBecomeAuthor(false);
      // Reload data
      const d = await api.getDashboardStats();
      setData(d);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBecomingAuthor(false);
    }
  };

  // Max for chart
  const maxEarnings = data ? Math.max(...data.monthly_earnings.map(m => m.amount), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm">Назад</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <Icon name="User" size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">{user.display_name || user.username}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Not author yet */}
        {!user.is_author && !showBecomeAuthor && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 neon-glow">
              <Icon name="TrendingUp" size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Стань автором ViewWave</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Создай канал, загружай видео и зарабатывай с первого просмотра. Без минимального порога выплат.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              {[
                { icon: "Eye", label: "₽0.50", sub: "за 1000 просм." },
                { icon: "Users", label: "70%", sub: "от подписок" },
                { icon: "Gift", label: "90%", sub: "от донатов" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
                  <Icon name={s.icon} size={20} className="text-primary mx-auto mb-1" />
                  <div className="font-black text-lg">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowBecomeAuthor(true)}
              className="gradient-primary text-white px-8 py-3 rounded-2xl font-black text-lg neon-glow hover:opacity-90 transition-opacity"
            >
              Создать канал — бесплатно
            </button>
          </div>
        )}

        {/* Become author form */}
        {!user.is_author && showBecomeAuthor && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Создай свой канал</h2>
            <form onSubmit={handleBecomeAuthor} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Название канала *</label>
                <input
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  placeholder="Мой крутой канал"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                <textarea
                  value={channelDesc}
                  onChange={e => setChannelDesc(e.target.value)}
                  placeholder="О чём твой канал?"
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              {error && (
                <div className="text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2">{error}</div>
              )}
              <button
                type="submit"
                disabled={becomingAuthor}
                className="w-full gradient-primary text-white rounded-xl py-3 font-bold neon-glow hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {becomingAuthor ? <><Icon name="Loader2" size={16} className="animate-spin" />Создаём...</> : "Создать канал"}
              </button>
            </form>
          </div>
        )}

        {/* Dashboard for author */}
        {user.is_author && (
          <>
            {loading && (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3" />
                <p>Загружаем статистику...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-10 text-destructive">
                <Icon name="AlertCircle" size={32} className="mx-auto mb-3" />
                <p>{error}</p>
              </div>
            )}

            {data && !loading && (
              <div className="space-y-6 animate-fade-in">
                {/* Channel header */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center neon-glow">
                      <Icon name="Tv" size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{data.channel.name}</h2>
                      <p className="text-sm text-muted-foreground">{data.channel.description || "Нет описания"}</p>
                    </div>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Подписчиков", value: data.channel.subscribers.toLocaleString("ru-RU"), icon: "Users", color: "from-purple-600 to-pink-600", sub: `+${data.new_subscribers_30d} за 30 дней` },
                    { label: "Всего просмотров", value: (data.channel.total_views / 1000).toFixed(1) + "K", icon: "Eye", color: "from-blue-600 to-cyan-500", sub: "за всё время" },
                    { label: "Заработано всего", value: formatMoney(data.channel.total_earnings), icon: "Wallet", color: "from-orange-500 to-red-500", sub: "за всё время" },
                    { label: "Видео на канале", value: data.videos.length.toString(), icon: "Video", color: "from-green-500 to-teal-500", sub: "опубликовано" },
                  ].map((m, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3`}>
                        <Icon name={m.icon} size={18} className="text-white" />
                      </div>
                      <div className="text-2xl font-black">{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="text-xs text-primary mt-1">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Earnings by source + chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* By source */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-bold mb-4">Заработок по источникам</h3>
                    <div className="space-y-3">
                      {[
                        { key: "views", label: "Просмотры", icon: "Eye", color: "bg-purple-500" },
                        { key: "subscriptions", label: "Подписки", icon: "Users", color: "bg-blue-500" },
                        { key: "donations", label: "Донаты", icon: "Gift", color: "bg-orange-500" },
                      ].map(s => {
                        const amount = data.earnings_by_source[s.key] || 0;
                        const total = Object.values(data.earnings_by_source).reduce((a, b) => a + b, 0) || 1;
                        const pct = Math.round((amount / total) * 100);
                        return (
                          <div key={s.key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Icon name={s.icon} size={14} className="text-muted-foreground" />
                                <span className="text-sm">{s.label}</span>
                              </div>
                              <span className="text-sm font-bold">{formatMoney(amount)}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly chart */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-bold mb-4">Доход за 6 месяцев</h3>
                    <div className="flex items-end gap-2 h-32">
                      {data.monthly_earnings.map((m, i) => {
                        const height = Math.max((m.amount / maxEarnings) * 100, 4);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full gradient-primary rounded-t-md transition-all"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                    {data.monthly_earnings.every(m => m.amount === 0) && (
                      <p className="text-xs text-muted-foreground text-center -mt-8">Заработок появится после первых просмотров</p>
                    )}
                  </div>
                </div>

                {/* Videos list */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Мои видео ({data.videos.length})</h3>
                  {data.videos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="VideoOff" size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Видео ещё не загружены</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.videos.map(v => (
                        <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
                          {v.thumbnail_url ? (
                            <img src={v.thumbnail_url} alt={v.title} className="w-20 h-12 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Icon name="Video" size={16} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{v.title}</p>
                            <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>{v.views.toLocaleString()} просм.</span>
                              <span>{v.likes} ♥</span>
                              <span>{v.comments} комм.</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-primary">{formatMoney(v.earnings)}</div>
                            <div className="text-xs text-muted-foreground">заработано</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
