import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GitHubRepoView } from "./github-repo-view";

describe("GitHubRepoView", () => {
  it("renders fallback link when data is null", () => {
    render(<GitHubRepoView repo="vercel/next.js" data={null} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/vercel/next.js");
    expect(screen.getByText("vercel/next.js")).toBeInTheDocument();
  });

  it("renders repo card when data present", () => {
    render(
      <GitHubRepoView
        repo="vercel/next.js"
        data={{
          description: "The React Framework",
          stargazers_count: 1234,
          forks_count: 56,
          language: "TypeScript",
          html_url: "https://github.com/vercel/next.js",
          full_name: "vercel/next.js",
        }}
      />,
    );
    expect(screen.getByText("The React Framework")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
  });
});
