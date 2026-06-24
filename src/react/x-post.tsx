"use client";

import { useEffect, useState } from "react";
import { XPostView, type TweetData } from "../components";

export function XPost({ id }: { id: string }) {
  const [tweet, setTweet] = useState<TweetData | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`);
        const json = (await res.json()) as { data?: TweetData };
        if (active) setTweet(json.data ?? null);
      } catch {
        if (active) setTweet(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (tweet === undefined) return null;
  return <XPostView tweet={tweet} />;
}
