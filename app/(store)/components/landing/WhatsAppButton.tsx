/* Floating "Chat us now" button — opens WhatsApp for customer queries.
   Rendered once in the root layout so it appears on every page. */

// Store WhatsApp number (same one used on Contact / Stores pages).
const WHATSAPP_NUMBER = "919876543210";
const PREFILL = "Hi AV Creation, I have a query about";

const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

export default function WhatsAppButton() {
  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="wa-fab-ic" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26">
          <path
            fill="currentColor"
            d="M16.04 4C9.95 4 5 8.95 5 15.04c0 1.95.51 3.86 1.48 5.54L5 28l7.62-1.46a11 11 0 0 0 3.42.55h.01c6.08 0 11.03-4.95 11.04-11.04A11 11 0 0 0 16.04 4Zm0 20.18h-.01a9.1 9.1 0 0 1-3.95-.91l-.28-.14-2.94.56.59-2.87-.18-.29a9.06 9.06 0 0 1-1.39-4.49C7.49 9.94 11.31 6.12 16.05 6.12c2.4 0 4.65.94 6.34 2.63a8.92 8.92 0 0 1 2.62 6.31c-.01 5.02-3.83 8.84-8.97 8.84Zm5.02-6.62c-.27-.14-1.63-.8-1.88-.9-.25-.09-.43-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.21-1.36-.82-.73-1.37-1.63-1.53-1.9-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.66 1.12 2.84.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.19-.52-.32Z"
          />
        </svg>
      </span>
      <span className="wa-fab-label">Chat us now</span>
    </a>
  );
}
