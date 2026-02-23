CREATE TABLE t_p93453192_yt_clone_project.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    is_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p93453192_yt_clone_project.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p93453192_yt_clone_project.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES t_p93453192_yt_clone_project.users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    banner_url TEXT,
    avatar_url TEXT,
    subscribers_count INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_earnings NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p93453192_yt_clone_project.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.channels(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0,
    views_count BIGINT DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'published',
    earnings NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p93453192_yt_clone_project.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.users(id),
    channel_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.channels(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

CREATE TABLE t_p93453192_yt_clone_project.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.users(id),
    video_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.videos(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE TABLE t_p93453192_yt_clone_project.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.users(id),
    video_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.videos(id),
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p93453192_yt_clone_project.earnings_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES t_p93453192_yt_clone_project.channels(id),
    amount NUMERIC(10,2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
