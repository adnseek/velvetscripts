import { LightboxImage } from "./ImageLightbox";

export interface StoryImage {
  sectionIdx: number;
  heading?: string | null;
  filename: string;
}

interface StoryContentProps {
  content: string;
  images?: StoryImage[];
}

export default function StoryContent({ content, images = [] }: StoryContentProps) {
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  const imageMap = new Map<number, StoryImage>();
  for (const img of images) {
    if (img.filename) {
      imageMap.set(img.sectionIdx, img);
    }
  }

  let h2Count = -1;
  let isFirstParagraphInSection = true;

  return (
    <div className="max-w-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();

        // H1 title — skip it (already shown in page header)
        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
          return null;
        }

        // H2 section heading
        if (trimmed.startsWith("## ")) {
          h2Count++;
          isFirstParagraphInSection = true;
          const sectionImage = imageMap.get(h2Count);
          const floatSide = h2Count % 2 === 0 ? "left" : "right";

          return (
            <div key={index} className="clear-both">
              {/* Section divider */}
              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="text-red-600 text-lg">✦</span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                {trimmed.replace(/^##\s+/, "")}
              </h2>

              {/* Floated magazine image — clickable lightbox */}
              {sectionImage && (
                <LightboxImage
                  src={sectionImage.filename}
                  alt={sectionImage.heading || "Story scene"}
                  className={`relative mb-4 ${
                    floatSide === "left"
                      ? "md:float-left md:mr-6 md:mb-4"
                      : "md:float-right md:ml-6 md:mb-4"
                  } w-full md:w-[45%] rounded-lg overflow-hidden border border-gray-800 shadow-[0_0_20px_rgba(220,38,38,0.08)] cursor-zoom-in group/img`}
                >
                  <img
                    src={sectionImage.filename}
                    alt={sectionImage.heading || "Story scene"}
                    className="w-full h-auto transition-transform duration-300 group-hover/img:scale-105"
                    loading="lazy"
                  />
                  {sectionImage.heading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                      <p className="text-gray-300 text-xs italic">{sectionImage.heading}</p>
                    </div>
                  )}
                </LightboxImage>
              )}
            </div>
          );
        }

        // Regular paragraph
        const useDropCap = isFirstParagraphInSection;
        if (isFirstParagraphInSection) {
          isFirstParagraphInSection = false;
        }

        return (
          <p
            key={index}
            className={`text-gray-300 text-lg leading-[1.9] mb-5 ${useDropCap ? "drop-cap" : ""}`}
          >
            {paragraph}
          </p>
        );
      })}

      {/* Clear floats at the end */}
      <div className="clear-both"></div>
    </div>
  );
}
