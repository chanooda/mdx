"use client";

import { useEffect, useState } from "react";
import { GitHubRepoView, type GitHubRepoData } from "../components";

export function GitHubRepo({ repo }: { repo: string }) {
  const [data, setData] = useState<GitHubRepoData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`);
        if (res.ok && active) setData((await res.json()) as GitHubRepoData);
      } catch {
        if (active) setData(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [repo]);

  return <GitHubRepoView repo={repo} data={data} />;
}
