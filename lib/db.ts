import { prisma } from './prisma';

export interface Story {
  id: string;
  slug: string;
  title: string;
  content: string;
  theme: string;
  style: string;
  excerpt: string;
  createdAt: Date;
  published: boolean;
  views: number;
  seoTitle: string;
  seoDescription: string;
  femaleAppearance?: string | null;
  storyType: string;
  intensity: number;
  city?: string | null;
  locationId?: string | null;
}

export const db = {
  stories: {
    getAll: async () => {
      const stories = await prisma.story.findMany({
        orderBy: { createdAt: 'desc' },
        include: { location: true, images: { orderBy: { sectionIdx: 'asc' } } },
      });
      return stories;
    },
    getBySlug: async (slug: string) => {
      const story = await prisma.story.findUnique({
        where: { slug },
        include: {
          location: true,
          images: { orderBy: { sectionIdx: 'asc' } },
        },
      });
      return story || undefined;
    },
    getPublished: async () => {
      const stories = await prisma.story.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
          location: true,
          images: { orderBy: { sectionIdx: 'asc' } },
        },
      });
      return stories;
    },
    getFiltered: async (filters: { storyType?: string; city?: string; locationSlug?: string; intensity?: number }) => {
      const where: any = { published: true };
      if (filters.storyType) where.storyType = filters.storyType;
      if (filters.city) where.city = filters.city;
      if (filters.intensity) where.intensity = filters.intensity;
      if (filters.locationSlug) {
        where.location = { slug: filters.locationSlug };
      }
      const stories = await prisma.story.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          location: true,
          images: { orderBy: { sectionIdx: 'asc' } },
        },
      });
      return stories;
    },
    create: async (story: Omit<Story, 'id' | 'createdAt' | 'views'>) => {
      const created = await prisma.story.create({
        data: {
          slug: story.slug,
          title: story.title,
          content: story.content,
          theme: story.theme,
          style: story.style,
          excerpt: story.excerpt || '',
          published: story.published,
          seoTitle: story.seoTitle || story.title,
          seoDescription: story.seoDescription || story.excerpt || '',
          femaleAppearance: story.femaleAppearance || null,
          storyType: story.storyType || 'real',
          intensity: story.intensity || 5,
          city: story.city || null,
          locationId: story.locationId || null,
        },
      });
      return created;
    },
    update: async (id: string, updates: Partial<Story>) => {
      const updated = await prisma.story.update({
        where: { id },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.published !== undefined && { published: updates.published }),
          ...(updates.excerpt && { excerpt: updates.excerpt }),
          ...(updates.seoTitle && { seoTitle: updates.seoTitle }),
          ...(updates.seoDescription && { seoDescription: updates.seoDescription }),
          ...(updates.femaleAppearance !== undefined && { femaleAppearance: updates.femaleAppearance || null }),
          ...(updates.storyType && { storyType: updates.storyType }),
          ...(updates.intensity !== undefined && { intensity: updates.intensity }),
          ...(updates.city !== undefined && { city: updates.city || null }),
          ...(updates.locationId !== undefined && { locationId: updates.locationId || null }),
        },
      });
      return updated;
    },
    delete: async (id: string) => {
      // Delete image files from disk
      const { rm } = await import("fs/promises");
      const path = await import("path");
      const imageDir = path.join(process.cwd(), "public", "images", "stories", id);
      try {
        await rm(imageDir, { recursive: true, force: true });
      } catch {
        // Directory may not exist, ignore
      }
      // DB cascade deletes StoryImage rows automatically
      await prisma.story.delete({ where: { id } });
    },
    incrementViews: async (slug: string) => {
      await prisma.story.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    },
  },
};
