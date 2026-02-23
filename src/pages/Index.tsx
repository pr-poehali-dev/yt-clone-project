import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { videos, subscribedChannels, categories, Video, formatMoney } from "@/data/videos";

type Tab = "home" | "search" | "subscriptions" | "earnings";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set(["ch1", "ch2", "ch4", "ch5"]));

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (activeCategory !== "Все") {
      result = result.filter(v => v.category === activeCategory);
    }
    if (activeTab === "subscriptions") {
      result = result.filter(v => subscribedIds.has(v.channel.id));
    }
    return result;
  }, [activeCategory, activeTab, subscribedIds]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return videos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const toggleSubscribe = (channelId: string) => {
    setSubscribedIds(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  };

  const nav = [
    { id: "home" as Tab, icon: "Home", label: "Главная" },
    { id: "search" as Tab, icon: "Search", label: "Поиск" },
    { id: "subscriptions" as Tab, icon: "Users", label: "Подписки" },
    { id: "earnings" as Tab, icon: "TrendingUp", label: "Заработок" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 glass border-r border-border ${
          sidebarOpen ? "w-56" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 neon-glow">
            <Icon name="Play" size={16} className="text-white ml-0.5" />
          </div>
          {sidebarOpen && (
            <span className="font-black text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ViewWave
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "gradient-primary text-white neon-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name={item.icon} size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Subscribed channels */}
        {sidebarOpen && (
          <div className="px-3 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Подписки</p>
            <div className="space-y-1">
              {subscribedChannels.slice(0, 4).map(ch => (
                <div key={ch.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                  <img src={ch.avatar} alt={ch.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <span className="text-xs text-foreground truncate">{ch.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-3 p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name={sidebarOpen ? "ChevronsLeft" : "ChevronsRight"} size={16} />
        </button>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-56" : "ml-16"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border px-6 py-3 flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Поиск видео, каналов..."
                className="w-full bg-secondary border border-border rounded-full pl-9 pr-12 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 gradient-primary rounded-full flex items-center justify-center"
              >
                <Icon name="ArrowRight" size={13} className="text-white" />
              </button>
            </div>
          </form>

          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-full text-sm font-bold neon-glow hover:opacity-90 transition-opacity">
            <Icon name="Upload" size={15} />
            Загрузить
          </button>

          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center cursor-pointer">
            <Icon name="User" size={16} className="text-white" />
          </div>
        </header>

        <div className="px-6 py-6">

          {/* HOME */}
          {activeTab === "home" && (
            <div className="animate-fade-in">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "gradient-primary text-white neon-glow"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-border"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Icon name="VideoOff" size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Видео не найдены</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredVideos.map(v => (
                    <VideoCard key={v.id} video={v} onClick={setSelectedVideo} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEARCH */}
          {activeTab === "search" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6">
                {searchQuery ? `Результаты: «${searchQuery}»` : "Поиск"}
              </h2>

              {!searchQuery && (
                <div className="mb-8">
                  <p className="text-muted-foreground text-sm mb-4">Популярные категории</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.slice(1).map((cat, i) => {
                      const colors = [
                        "from-purple-600 to-pink-600",
                        "from-blue-600 to-cyan-500",
                        "from-orange-500 to-red-600",
                        "from-green-500 to-teal-500",
                        "from-yellow-500 to-orange-500",
                        "from-pink-600 to-rose-500",
                        "from-indigo-600 to-blue-500",
                        "from-teal-500 to-cyan-400",
                      ];
                      return (
                        <button
                          key={cat}
                          onClick={() => { setActiveTab("home"); setActiveCategory(cat); }}
                          className={`relative h-20 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-end p-3 overflow-hidden hover:scale-105 transition-transform cursor-pointer`}
                        >
                          <span className="font-bold text-white text-sm relative z-10">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Ничего не найдено по запросу «{searchQuery}»</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map(v => (
                    <VideoCard key={v.id} video={v} onClick={setSelectedVideo} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBSCRIPTIONS */}
          {activeTab === "subscriptions" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Подписки</h2>

              {/* Channel circles */}
              <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
                {subscribedChannels.map(ch => (
                  <div key={ch.id} className="flex-shrink-0 text-center group cursor-pointer">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors mx-auto">
                        <img src={ch.avatar} alt={ch.name} className="w-full h-full object-cover" />
                      </div>
                      {ch.verified && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                          <Icon name="Check" size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium w-16 truncate">{ch.name}</p>
                    <button
                      onClick={() => toggleSubscribe(ch.id)}
                      className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                        subscribedIds.has(ch.id)
                          ? "bg-secondary text-muted-foreground"
                          : "gradient-primary text-white"
                      }`}
                    >
                      {subscribedIds.has(ch.id) ? "Подписан" : "Подписаться"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Videos from subscribed channels */}
              <h3 className="font-bold text-base mb-4">Последние видео</h3>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Icon name="Rss" size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Подпишись на каналы, чтобы видеть их видео</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredVideos.map(v => (
                    <VideoCard key={v.id} video={v} onClick={setSelectedVideo} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EARNINGS */}
          {activeTab === "earnings" && (
            <div className="animate-fade-in">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center neon-glow">
                    <Icon name="DollarSign" size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Система заработка ViewWave</h2>
                    <p className="text-sm text-muted-foreground">Монетизируй свой контент</p>
                  </div>
                </div>

                {/* Big stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Выплачено авторам", value: "₽12.4M", icon: "Wallet", color: "from-purple-600 to-pink-600" },
                    { label: "Активных авторов", value: "18 420", icon: "Users", color: "from-blue-600 to-cyan-500" },
                    { label: "Ср. заработок/месяц", value: "₽42 000", icon: "TrendingUp", color: "from-orange-500 to-red-500" },
                    { label: "Ставка за 1000 просм.", value: "₽0.50", icon: "Eye", color: "from-green-500 to-teal-500" },
                  ].map((s, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 hover-scale">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                        <Icon name={s.icon} size={18} className="text-white" />
                      </div>
                      <div className="text-2xl font-black">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* How it works */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-5">Как зарабатывают авторы</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      {
                        icon: "Eye",
                        title: "Просмотры",
                        desc: "Получай 0.50₽ за каждую 1000 просмотров. Без минимального порога — деньги начисляются с первого ролика.",
                        color: "from-purple-600 to-pink-600",
                      },
                      {
                        icon: "Users",
                        title: "Подписки",
                        desc: "Получай 70% от стоимости платной подписки твоих фанатов. Чем больше подписчиков — тем стабильнее доход.",
                        color: "from-blue-600 to-cyan-500",
                      },
                      {
                        icon: "Gift",
                        title: "Донаты",
                        desc: "Зрители могут поддержать тебя прямо во время стрима или под видео. Комиссия платформы всего 10%.",
                        color: "from-orange-500 to-red-500",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                          <Icon name={item.icon} size={22} className="text-white" />
                        </div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top earners */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4">Топ авторов месяца</h3>
                  <div className="space-y-3">
                    {[
                      { name: "TechReview RU", earnings: 230000, subs: "2.1M" },
                      { name: "Максим Про", earnings: 84000, subs: "1.2M" },
                      { name: "Дикая Природа", earnings: 56000, subs: "890K" },
                      { name: "МозгоШтурм", earnings: 38000, subs: "670K" },
                    ].map((author, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
                        <span className={`text-sm font-black w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                          #{i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                          <Icon name="User" size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{author.name}</p>
                          <p className="text-xs text-muted-foreground">{author.subs} подписчиков</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatMoney(author.earnings)}</p>
                          <p className="text-xs text-muted-foreground">в этом месяце</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full gradient-primary text-white rounded-2xl py-4 font-black text-lg neon-glow hover:opacity-90 transition-opacity">
                  Начать зарабатывать — это бесплатно
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
