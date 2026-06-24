interface YouTubeProps {
  id: string;
  title?: string;
  className?: string;
}

export function YouTube({ id, title = "YouTube video", className }: YouTubeProps) {
  return (
    <div className={`mdx-embed mdx-embed--video${className ? ` ${className}` : ""}`}>
      <div className="mdx-embed__aspect">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="mdx-embed__iframe"
        />
      </div>
    </div>
  );
}
