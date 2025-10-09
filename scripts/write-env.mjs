import { writeFileSync } from 'fs';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
const isProd = process.env.VERCEL_ENV === 'production';

const content = `
// ⚙️ Auto-generado por write-env.mjs
export const environment = {
  production: ${isProd},
  apiBaseUrl: '${apiBaseUrl}'
};
`;

writeFileSync('src/environments/environment.ts', content);
writeFileSync('src/environments/environment.prod.ts', content);
console.log('[env] VERCEL_ENV=%s API_BASE_URL=%s', process.env.VERCEL_ENV, apiBaseUrl);
