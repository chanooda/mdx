import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { File, FileTree, Folder } from "./file-tree";

describe("FileTree", () => {
  it("renders folders and files; hides children when defaultOpen is false", () => {
    render(
      <FileTree>
        <Folder name="src">
          <File name="index.ts" />
        </Folder>
        <Folder name="hidden" defaultOpen={false}>
          <File name="secret.ts" />
        </Folder>
      </FileTree>,
    );
    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("index.ts")).toBeInTheDocument();
    expect(screen.queryByText("secret.ts")).not.toBeInTheDocument();
  });
});
