import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderiza el markdown de las respuestas de los asistentes.
 * Seguro por defecto: no interpreta HTML (skipHtml) ni usa dangerouslySetInnerHTML.
 */
const components: Components = {
  h1: ({ children }) => <h3 className="mt-4 text-heading text-ink first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 text-heading text-ink first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 text-label text-ink first:mt-0">{children}</h4>,
  h4: ({ children }) => <h4 className="mt-3 text-label text-ink first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-2 border-border-strong pl-3 text-ink-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1 align-top">{children}</td>,
  code: ({ children }) => <code className="rounded-sm bg-surface px-1 text-body-sm">{children}</code>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-body text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
