import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getCatalog } from '../../../../lib/recipes';
import { IMAGE_RATIOS, recipeImageSvg, type ImageRatio } from '../../../../lib/recipeImage';

export async function getStaticPaths() {
  const { recipes, categoryById, cuisineById } = await getCatalog();
  return recipes.flatMap((r) =>
    (Object.keys(IMAGE_RATIOS) as ImageRatio[]).map((ratio) => ({
      params: { slug: r.id, ratio },
      props: {
        image: r.data.image,
        icon: r.data.icon,
        iconColors: r.data.iconColors,
        iconExtra: r.data.iconExtra,
        color: categoryById.get(r.data.category.id)?.data.color || cuisineById.get(r.data.cuisine?.id ?? "")?.data.color || '#9e3039',
      },
    })),
  );
}

// A recipe photo (public/images/recipes/...) is cropped to the ratio, keeping the most
// interesting part of the picture. Without a photo the dish illustration is drawn instead.
export const GET: APIRoute = async ({ params, props }) => {
  const ratio = params.ratio as ImageRatio;
  const [w, h] = IMAGE_RATIOS[ratio];
  const { image } = props as { image?: string };
  const photo = image && !/^https?:/.test(image) ? await fs.readFile(path.join('public', image)).catch(() => null) : null;
  const img = photo
    ? sharp(photo).rotate().resize(w, h, { fit: 'cover', position: sharp.strategy.attention })
    : sharp(Buffer.from(recipeImageSvg(props as Parameters<typeof recipeImageSvg>[0], ratio)));
  const jpg = await img.jpeg({ quality: photo ? 80 : 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
