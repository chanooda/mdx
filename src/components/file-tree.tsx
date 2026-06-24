import { FileIcon, FolderIcon } from "lucide-react";
import type { ReactNode } from "react";

export function FileTree({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mdx-file-tree${className ? ` ${className}` : ""}`}>
      <ul className="mdx-file-tree__list">{children}</ul>
    </div>
  );
}

export function Folder({
  name,
  children,
  defaultOpen = true,
  className,
}: {
  name: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <li className={`mdx-file-tree__folder${className ? ` ${className}` : ""}`}>
      <div className="mdx-file-tree__folder-label">
        <FolderIcon className="mdx-file-tree__folder-icon" />
        <span>{name}</span>
      </div>
      {defaultOpen && children && (
        <ul className="mdx-file-tree__children">{children}</ul>
      )}
    </li>
  );
}

export function File({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <li className={`mdx-file-tree__file${className ? ` ${className}` : ""}`}>
      <FileIcon className="mdx-file-tree__file-icon" />
      <span>{name}</span>
    </li>
  );
}
