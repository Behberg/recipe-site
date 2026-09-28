// Quiz scoring, shared by the quiz page script. Kept free of Astro imports so it ships to the browser.

/** sessionStorage key that remembers "quiz-id/result-id" for the person who just finished the quiz. */
export const MINE_KEY = 'dzervene-quiz-result';

/**
 * The winning result: the highest total, and on a tie the result that scored most recently,
 * so the last answers break the tie. `order` lists every result id, so one with no points can still be named.
 */
export function winner(order: string[], picks: Record<string, number>[]): string {
  const total: Record<string, number> = {};
  const last: Record<string, number> = {};
  picks.forEach((scores, i) => {
    for (const [id, p] of Object.entries(scores)) {
      total[id] = (total[id] ?? 0) + p;
      last[id] = i;
    }
  });
  return order.reduce((best, id) => {
    const a = total[id] ?? 0;
    const b = total[best] ?? 0;
    return a > b || (a === b && (last[id] ?? -1) > (last[best] ?? -1)) ? id : best;
  });
}
