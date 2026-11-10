/// <reference types="astro/client" />

interface ImportMetaEnv {
	/**
	 * Formspree endpoint that receives submissions (https://formspree.io/f/<id>).
	 * Empty means the form reports that it is not configured.
	 */
	readonly PUBLIC_FORM_ENDPOINT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
