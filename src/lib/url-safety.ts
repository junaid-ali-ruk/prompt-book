const SAFE_PROTOCOLS = new Set(["http:", "https:"]);
const MAX_IMAGE_FILE_SIZE_BYTES = 15 * 1024 * 1024;

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none"><rect width="1200" height="900" fill="#141218"/><rect x="96" y="96" width="1008" height="708" rx="28" fill="#1B1722" stroke="#2F2938" stroke-width="6"/><circle cx="276" cy="264" r="68" fill="#F97316" fill-opacity="0.18"/><path d="M264 244h112v24H264zm0 48h224v24H264zm0 48h320v24H264z" fill="#F8FAFC" fill-opacity="0.82"/><path d="M264 508h520v26H264zm0 58h444v26H264zm0 58h372v26H264z" fill="#A1A1AA" fill-opacity="0.72"/></svg>`;

export const FALLBACK_PROMPT_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

export function normalizeHttpUrl(value?: string | null) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getSafePromptImageSrc(value?: string | null) {
  return normalizeHttpUrl(value) ?? FALLBACK_PROMPT_IMAGE;
}

export function getSafePromptLiveUrl(value?: string | null) {
  return normalizeHttpUrl(value);
}

export function assertValidImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Upload a valid image file.");
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error("Images must be 15 MB or smaller.");
  }
}
