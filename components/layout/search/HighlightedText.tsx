import React from "react";

type HighlightedTextProps = {
  text: string;
  indices?: ReadonlyArray<readonly [number, number]>;
};

export default function HighlightedText({ text, indices }: HighlightedTextProps) {
  if (!indices || indices.length === 0) {
    return <span>{text}</span>;
  }

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  // Fuse.js indices are inclusive, i.e., [start, end] means characters from start to end.
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  sortedIndices.forEach(([start, end], idx) => {
    // Add non-matching prefix text
    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start));
    }
    // Add matching bold text
    result.push(
      <strong key={idx} className="font-bold text-primary">
        {text.slice(start, end + 1)}
      </strong>
    );
    lastIndex = end + 1;
  });

  // Add remaining suffix text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <span>{result}</span>;
}
