import { GitHubRepoView, type GitHubRepoData } from "../components";

export async function fetchGitHubRepo(
  repo: string,
): Promise<GitHubRepoData | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
    } as RequestInit);
    if (res.ok) return (await res.json()) as GitHubRepoData;
  } catch {}
  return null;
}

export async function GitHubRepo({ repo }: { repo: string }) {
  const data = await fetchGitHubRepo(repo);
  return <GitHubRepoView repo={repo} data={data} />;
}
