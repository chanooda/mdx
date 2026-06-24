import { Callout } from "./callout";
import { CodeSandbox } from "./embed/code-sandbox";
import { GitHubGist } from "./embed/github-gist";
import { YouTube } from "./embed/youtube";
import { File, FileTree, Folder } from "./file-tree";
import { Step, Steps } from "./steps";
import { Tab, Tabs } from "./tabs";
import { GitHubRepoView, type GitHubRepoData } from "./embed/github-repo-view";

export { Callout } from "./callout";
export { CodeSandbox } from "./embed/code-sandbox";
export { GitHubGist } from "./embed/github-gist";
export type { GitHubRepoData };
export { GitHubRepoView } from "./embed/github-repo-view";
export { XPostView, type TweetData } from "./embed/x-post-view";
export { YouTube } from "./embed/youtube";
export { File, FileTree, Folder } from "./file-tree";
export { Step, Steps } from "./steps";
export { Tab, Tabs } from "./tabs";

export const presentationalComponents = {
  Callout,
  Steps,
  Step,
  YouTube,
  CodeSandbox,
  GitHubGist,
  Tabs,
  Tab,
  FileTree,
  File,
  Folder,
};
