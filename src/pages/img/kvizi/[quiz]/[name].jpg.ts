import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { LANGS, t, type Lang } from '../../../../i18n';
import { announceResult, getQuizzes, type QuizImageKind } from '../../../../lib/quizzes';
import { coverSvg, resultOgSvg, resultStorySvg } from '../../../../lib/quizImage';

// Per quiz and language: a cover for the quiz page, and a link preview plus a story picture per result.
export async function getStaticPaths() {
  const paths = [];
  for (const lang of LANGS) {
    for (const quiz of await getQuizzes(lang)) {
      paths.push({
        params: { quiz: quiz.id, name: `cover-${lang}` },
        props: { svg: coverSvg({ title: quiz.title, hook: quiz.hook, cta: t(lang, 'quiz.imageCta'), color: quiz.color, icons: quiz.results.map((r) => r.icon) }) },
      });
      for (const r of quiz.results) {
        for (const kind of ['og', 'story'] as QuizImageKind[]) {
          const card = {
            question: quiz.title,
            line: announceResult(quiz, r, lang),
            tagline: r.tagline,
            traits: r.traits,
            cta: t(lang as Lang, kind === 'og' ? 'quiz.imageCta' : 'quiz.storyCta'),
            color: r.color,
            icon: r.icon,
          };
          paths.push({
            params: { quiz: quiz.id, name: `${r.id}-${lang}-${kind}` },
            props: { svg: kind === 'og' ? resultOgSvg(card) : resultStorySvg(card) },
          });
        }
      }
    }
  }
  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const jpg = await sharp(Buffer.from((props as { svg: string }).svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
