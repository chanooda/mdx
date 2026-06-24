import { GitHubLogoIcon } from "@radix-ui/react-icons";

export interface GitHubRepoData {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  full_name: string;
}

interface GitHubRepoViewProps {
  repo: string;
  data: GitHubRepoData | null;
  className?: string;
}

export function GitHubRepoView({ repo, data, className }: GitHubRepoViewProps) {
  if (!data) {
    return (
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`mdx-gh-repo mdx-gh-repo--fallback${className ? ` ${className}` : ""}`}
      >
        <GitHubLogoIcon />
        {repo}
      </a>
    );
  }

  return (
    <a
      href={data.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mdx-gh-repo${className ? ` ${className}` : ""}`}
    >
      <div className="mdx-gh-repo__title">
        <GitHubLogoIcon />
        {data.full_name}
      </div>
      {data.description && <p className="mdx-gh-repo__desc">{data.description}</p>}
      <div className="mdx-gh-repo__stats">
        {data.language && <span>{data.language}</span>}
        <span>★ {data.stargazers_count.toLocaleString()}</span>
        <span>⑂ {data.forks_count.toLocaleString()}</span>
      </div>
    </a>
  );
}
