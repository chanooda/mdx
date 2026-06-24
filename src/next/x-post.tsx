import { getTweet } from "react-tweet/api";
import { XPostView } from "../components";

export async function XPost({ id }: { id: string }) {
  let tweet: Awaited<ReturnType<typeof getTweet>> | undefined;
  try {
    tweet = await getTweet(id);
  } catch {
    return (
      <div className="mdx-x-post__error">Tweet could not be loaded.</div>
    );
  }
  return <XPostView tweet={tweet} />;
}
