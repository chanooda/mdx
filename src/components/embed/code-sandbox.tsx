interface CodeSandboxProps {
  id: string;
  title?: string;
  className?: string;
}

export function CodeSandbox({
  id,
  title = "CodeSandbox",
  className,
}: CodeSandboxProps) {
  return (
    <div className={`mdx-embed${className ? ` ${className}` : ""}`}>
      <iframe
        src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        className="mdx-embed__iframe-sandbox"
      />
    </div>
  );
}
