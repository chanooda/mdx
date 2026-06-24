interface GitHubGistProps {
  id: string;
  className?: string;
}

export function GitHubGist({ id, className }: GitHubGistProps) {
  return (
    <div className={`mdx-embed${className ? ` ${className}` : ""}`}>
      <iframe
        src={`https://gist.github.com/${id}.pibb`}
        title={`GitHub Gist ${id}`}
        className="mdx-embed__iframe-gist"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      />
    </div>
  );
}
