import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If block prop is set, render the whole string as display math
    if (block) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    // Split text into normal text and math segments ($...$ or $$...$$)
    // We replace $$...$$ first, then $...$
    const parts: string[] = [];
    const normalized = content.replace(/\\n/g, '\n');
    let remaining = normalized;

    // Pattern for $$block math$$ or $inline math$
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalized)) !== null) {
      // Normal text before match
      if (match.index > lastIndex) {
        const textSegment = normalized.slice(lastIndex, match.index);
        parts.push(escapeHtml(textSegment).replace(/\n/g, '<br/>'));
      }

      const rawMatch = match[0];
      const isDisplay = rawMatch.startsWith('$$');
      const mathCode = isDisplay ? rawMatch.slice(2, -2).trim() : rawMatch.slice(1, -1).trim();

      try {
        const rendered = katex.renderToString(mathCode, {
          displayMode: isDisplay,
          throwOnError: false,
        });
        parts.push(rendered);
      } catch {
        parts.push(escapeHtml(rawMatch));
      }

      lastIndex = match.index + rawMatch.length;
    }

    if (lastIndex < normalized.length) {
      const remainingText = normalized.slice(lastIndex);
      parts.push(escapeHtml(remainingText).replace(/\n/g, '<br/>'));
    }

    return parts.join('');
  }, [content, block]);

  return (
    <span
      className={`leading-relaxed text-inherit ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathRenderer;
