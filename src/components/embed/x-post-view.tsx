import type { getTweet } from "react-tweet/api";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";

export type TweetData = Awaited<ReturnType<typeof getTweet>>;

interface XPostViewProps {
  tweet: TweetData | null | undefined;
  className?: string;
}

export function XPostView({ tweet, className }: XPostViewProps) {
  if (!tweet) return <TweetNotFound />;

  // react-tweet bug: entity arrays can be undefined from the API even though
  // types say they're required — addEntities does for...of without null check
  if (tweet.entities) {
    tweet.entities.hashtags ??= [];
    tweet.entities.user_mentions ??= [];
    tweet.entities.urls ??= [];
    tweet.entities.symbols ??= [];
  }

  return (
    <div className={`mdx-x-post${className ? ` ${className}` : ""}`}>
      <EmbeddedTweet tweet={tweet} />
    </div>
  );
}
