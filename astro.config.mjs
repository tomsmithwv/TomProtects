import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default {
  site: 'https://tomprotects.com',
  integrations: [sitemap()],
  output: 'server',
  adapter: cloudflare(),
};
