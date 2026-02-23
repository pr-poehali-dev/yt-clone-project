import Icon from "@/components/ui/icon";
import { Video, formatViews, formatSubscribers } from "@/data/videos";

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div
      className="group cursor-pointer hover-scale animate-fade-in"
      onClick={() => onClick(video)}
    >
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-muted">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
          {video.duration}
        </span>
        {video.earnings && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <Icon name="TrendingUp" size={10} />
            Заработок вкл.
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center neon-glow">
            <Icon name="Play" size={20} className="text-white ml-1" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="shrink-0">
          <img
            src={video.channel.avatar}
            alt={video.channel.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-muted-foreground">{video.channel.name}</span>
            {video.channel.verified && (
              <Icon name="BadgeCheck" size={12} className="text-primary" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatViews(video.views)}</span>
            <span>·</span>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
