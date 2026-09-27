// Rebuilds the site once a day so new star ratings reach the structured data Google reads.
// Set BUILD_HOOK_URL in Netlify (Site configuration > Build hooks, then Environment variables).
// Without it this function does nothing.
import type { Config } from '@netlify/functions';

export default async () => {
  const hook = Netlify.env.get('BUILD_HOOK_URL');
  if (hook) await fetch(hook, { method: 'POST' });
};

export const config: Config = { schedule: '@daily' };
