// SvelteKit app type definitions
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface PrivateEnv {
			VENDOR_BASE_URL: string;
		  }
	}
}
/// <reference types="@sveltejs/kit" />
declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
	  onclick_outside?: () => void;
	}
  }
  
  // Add this for your feature aliases
  declare module '$features/*.svelte' {
	import type { SvelteComponentTyped } from 'svelte';
	const component: SvelteComponentTyped;
	export default component;
  }

export {};