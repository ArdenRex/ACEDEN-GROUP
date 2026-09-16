import { ogSize, ogContentType, renderOgImage } from './og-shared';

export const runtime = 'nodejs';
export const alt = 'AI Workflow Coordinator — Give it the work.';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOgImage();
}
