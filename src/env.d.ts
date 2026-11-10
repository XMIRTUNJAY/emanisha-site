/// <reference types="astro/client" />

interface ImportMetaEnv {
	/** Repository that receives form submissions (owner/name). */
	readonly PUBLIC_FORM_INBOX_REPO?: string;
	/**
	 * Token with Issues: write on the inbox repository only. It is public by
	 * necessity, so it is scoped to one throwaway repository.
	 */
	readonly PUBLIC_FORM_INBOX_TOKEN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
