import rehypePrettyCode from "rehype-pretty-code";
import { MDXRemote } from "next-mdx-remote/rsc";
import { presentationalComponents } from "../components";
import { rehypePrettyCodeOptions, remarkPlugins } from "../config";
import { GitHubRepo } from "./github-repo";
import { XPost } from "./x-post";

const components = { ...presentationalComponents, GitHubRepo, XPost };

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins,
          rehypePlugins: [
            [rehypePrettyCode as never, rehypePrettyCodeOptions()],
          ],
        },
      }}
    />
  );
}
