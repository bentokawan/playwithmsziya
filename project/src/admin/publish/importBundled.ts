import { OBJECT_IMAGES } from '@/assets/illustrations/objects';
import { uploadMedia } from '@/admin/media/upload';
import { listObjects, upsertObject } from '@/lib/supabase/db';

export async function importBundledMedia(): Promise<{
  readonly imported: number;
  readonly skipped: number;
  readonly error?: string;
}> {
  const objectsRes = await listObjects();
  if ('error' in objectsRes) {
    return { imported: 0, skipped: 0, error: objectsRes.error };
  }

  let imported = 0;
  let skipped = 0;

  for (const obj of objectsRes.data) {
    const bundledUrl = OBJECT_IMAGES[obj.id as keyof typeof OBJECT_IMAGES];
    if (obj.image_id || !bundledUrl) {
      skipped += 1;
      continue;
    }

    try {
      const res = await fetch(bundledUrl);
      if (!res.ok) {
        skipped += 1;
        continue;
      }
      const blob = await res.blob();
      const file = new File([blob], `${obj.id}.svg`, { type: 'image/svg+xml' });
      const uploaded = await uploadMedia({
        file,
        type: 'object-image',
        storagePrefix: `images/objects/${obj.id}`,
        license: 'project',
        author: 'AI v0',
        sourceUrl: null,
      });
      if (!uploaded.ok) {
        skipped += 1;
        continue;
      }
      const updated = await upsertObject({
        id: obj.id,
        name_id: obj.name_id,
        name_en: obj.name_en,
        image_id: uploaded.media.id,
        countable: obj.countable,
        card_face: obj.card_face,
        maze_goal: obj.maze_goal,
        active: obj.active,
      });
      if ('data' in updated) {
        imported += 1;
      } else {
        skipped += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  return { imported, skipped };
}
