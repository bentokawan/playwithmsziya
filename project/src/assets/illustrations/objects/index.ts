import type { ObjectId } from '@/content/objects';

const modules = import.meta.glob<string>('./*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const map: Record<string, string> = {};
for (const [filePath, url] of Object.entries(modules)) {
  const id = filePath.replace(/^\.\//, '').replace(/\.svg$/, '');
  map[id] = url;
}

export const OBJECT_IMAGES = map as Readonly<Record<ObjectId, string>>;
