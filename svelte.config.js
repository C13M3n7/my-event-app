import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // Add the alias configuration here
    alias: {
      '$lib': 'src/lib',
      '$lib/*': 'src/lib/*',
      '$features/*': 'src/features/*',  // Add this line
      '$features': 'src/features'
    },
    env: {
      dir: process.cwd()
  }
  },
  preprocess: [
    vitePreprocess(),
    sveltePreprocess({
      typescript: true,
    })
  ]
};

export default config;