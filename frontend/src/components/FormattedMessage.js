import React from "react";

/**
 * Component to display properly formatted AI chat messages
 * Supports line breaks, bold text, code blocks, and special formatting
 */
const FormattedMessage = ({ content, role }) => {
  // If it's a user message, just render it with line breaks
  if (role === "user") {
    return (
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  // For AI messages, parse and format the content
  const parseContent = (text) => {
    if (!text) return null;

    const elements = [];
    let remaining = text;
    let elementKey = 0;

    // Split by patterns and render appropriately
    const parts = remaining.split(/(\[FIELD STATUS.*?\]|\n\n|\n|`[^`]*`|\*\*[^*]*\*\*|###|##|#)/s);

    parts.forEach((part, idx) => {
      if (!part) return;

      // Field status block - display as a separate styled box
      if (part.startsWith("[FIELD STATUS")) {
        elements.push(
          <div
            key={elementKey++}
            className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-3 my-2 text-xs font-mono rounded overflow-hidden"
          >
            <div className="text-blue-700 dark:text-blue-200 whitespace-pre-wrap break-words">
              {part}
            </div>
          </div>
        );
        return;
      }

      // Double newline - add spacing
      if (part === "\n\n") {
        elements.push(<div key={elementKey++} className="h-2" />);
        return;
      }

      // Single newline - convert to line break
      if (part === "\n") {
        elements.push(<br key={elementKey++} />);
        return;
      }

      // Bold text (**text**)
      if (part.startsWith("**") && part.endsWith("**")) {
        elements.push(
          <strong key={elementKey++} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
        return;
      }

      // Inline code (`text`)
      if (part.startsWith("`") && part.endsWith("`")) {
        elements.push(
          <code
            key={elementKey++}
            className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200"
          >
            {part.slice(1, -1)}
          </code>
        );
        return;
      }

      // Headers - ignore as we're in a compact chat
      if (part.match(/^#+$/)) {
        return;
      }

      // Regular text
      if (part.trim()) {
        elements.push(
          <span key={elementKey++}>
            {part}
          </span>
        );
      }
    });

    return elements;
  };

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {parseContent(content)}
    </div>
  );
};

export default FormattedMessage;
