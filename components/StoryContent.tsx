"use client";

interface StoryContentProps {
  content: string;
}

export default function StoryContent({ content }: StoryContentProps) {
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();

        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
          return (
            <h1 key={index} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 mt-2">
              {trimmed.replace(/^#\s+/, "")}
            </h1>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-10 border-b border-gray-200 dark:border-gray-700 pb-2">
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }

        return (
          <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
