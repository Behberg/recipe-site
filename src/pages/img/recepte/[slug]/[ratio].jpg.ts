import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { getCatalog } from '../../../../lib/recipes';
import { IMAGE_RATIOS, recipeImageSvg, type ImageRatio } from '../../../../lib/recipeImage';

export async function getStaticPaths() {
  const { recipes, categoryById, cuisineById } = await getCatalog();
  return recipes.flatMap((r) =>
    (Object.keys(IMAGE_RATIOS) as ImageRatio[]).map((ratio) => ({
      params: { slug: r.id, ratio },
      props: {
        icon: r.data.icon,
        iconColors: r.data.iconColors,
        iconExtra: r.data.iconExtra,
        color: categoryById.get(r.data.category.id)?.data.color || cuisineById.get(r.data.cuisine.id)?.data.color || '#9e3039',
      },
    })),
  );
}

export const GET: APIRoute = async ({ params, props }) => {
  const svg = recipeImageSvg(props as Parameters<typeof recipeImageSvg>[0], params.ratio as ImageRatio);
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
