import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Video, formatViews, formatSubscribers, formatMoney } from "@/data/videos";

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

const mockComments: Comment[] = [
  { id: "1", user: "Алексей К.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", text: "Лучшее видео на канале! Так держать 🔥", likes: 342, time: "3 часа назад" },
  { id: "2", user: "Мария Соколова", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", text: "Очень полезно, спасибо за такой подробный разбор темы!", likes: 187, time: "5 часов назад" },
  { id: "3", user: "Дмитрий Т.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dima", text: "Давно искал такой контент. Подписался сразу!!", likes: 94, time: "1 день назад" },
  { id: "4", user: "Лена В.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lena", text: "Просто и понятно объясняешь, другие могут поучиться", likes: 56, time: "2 дня назад" },
];

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [commentText, setCommentText] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [shared, setShared] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm">Назад</span>
        </button>

        {/* Video */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 neon-glow">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform neon-glow">
              <Icon name="Play" size={36} className="text-white ml-2" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div className="h-full w-[35%] gradient-primary rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Title + actions */}
            <h1 className="text-xl font-bold text-foreground mb-4 leading-snug">{video.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              {/* Channel */}
              <div className="flex items-center gap-3">
                <img src={video.channel.avatar} alt={video.channel.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{video.channel.name}</span>
                    {video.channel.verified && <Icon name="BadgeCheck" size={14} className="text-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatSubscribers(video.channel.subscribers)} подписчиков</span>
                </div>
                <button
                  onClick={() => setSubscribed(!subscribed)}
                  className={`ml-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    subscribed
                      ? "bg-secondary text-secondary-foreground"
                      : "gradient-primary text-white neon-glow"
                  }`}
                >
                  {subscribed ? "Подписан" : "Подписаться"}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    liked ? "gradient-primary text-white" : "bg-secondary text-foreground hover:bg-border"
                  }`}
                >
                  <Icon name="ThumbsUp" size={16} />
                  {likes.toLocaleString("ru-RU")}
                </button>
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all bg-secondary hover:bg-border ${shared ? "text-primary" : "text-foreground"}`}
                >
                  <Icon name="Share2" size={16} />
                  {shared ? "Скопировано!" : "Поделиться"}
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="bg-card rounded-xl p-4 mb-6 flex gap-6 border border-border">
              <div className="text-center">
                <div className="text-lg font-bold">{formatViews(video.views)}</div>
                <div className="text-xs text-muted-foreground">Просмотры</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{video.uploadedAt}</div>
                <div className="text-xs text-muted-foreground">Дата</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{video.comments.toLocaleString("ru-RU")}</div>
                <div className="text-xs text-muted-foreground">Комментариев</div>
              </div>
              {video.earnings && (
                <div
                  className="text-center cursor-pointer"
                  onClick={() => setShowEarnings(!showEarnings)}
                >
                  <div className={`text-lg font-bold transition-all ${showEarnings ? "text-primary neon-text" : "blur-sm text-foreground"}`}>
                    {formatMoney(video.earnings)}
                  </div>
                  <div className="text-xs text-muted-foreground">Заработок автора</div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-bold text-base mb-4">{video.comments.toLocaleString("ru-RU")} комментариев</h3>
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full gradient-primary flex-shrink-0" />
                <div className="flex-1">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Напиши комментарий..."
                    className="w-full bg-transparent border-b border-border focus:border-primary outline-none pb-1.5 text-sm transition-colors"
                  />
                  {commentText && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setCommentText("")} className="text-xs text-muted-foreground hover:text-foreground">Отмена</button>
                      <button onClick={() => setCommentText("")} className="text-xs gradient-primary text-white px-3 py-1 rounded-full font-semibold">Отправить</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {mockComments.map(c => (
                  <div key={c.id} className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                      <img src={c.avatar} alt={c.user} className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">{c.user}</span>
                        <span className="text-xs text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-sm text-foreground/90">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Icon name="ThumbsUp" size={12} />
                          {c.likes}
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ответить</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Earnings panel */}
          <div>
            <div className="bg-card rounded-xl p-4 border border-primary/30 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Icon name="DollarSign" size={16} className="text-white" />
                </div>
                <span className="font-bold text-sm">Система заработка</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">За просмотры</span>
                  <span className="font-semibold text-primary">0.5 ₽ / 1000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">За подписку</span>
                  <span className="font-semibold text-primary">20 ₽ / мес</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Премиум доля</span>
                  <span className="font-semibold text-primary">70%</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Этот автор заработал</span>
                  <span className="font-bold text-primary">
                    {video.earnings ? formatMoney(video.earnings) : "—"}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 gradient-primary text-white rounded-xl py-2 text-sm font-bold hover:opacity-90 transition-opacity neon-glow">
                Стать автором
              </button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Начни создавать контент и зарабатывай с первого просмотра
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
