// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import metadata from '../../../../brand/branding.json';

const artwork = import.meta.glob('../../../../brand/assets/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export function appAsset(name: string): string {
  return /^assets\/[A-Za-z0-9_-]+\.(svg|png|ico)$/.test(name) ? artwork[`../../../../brand/${name}`] ?? '' : '';
}
export function publicLink(value: string): string {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export const appInfo = { ...metadata, icon: appAsset(metadata.appIcon), favicon: appAsset(metadata.appFavicon), poster: appAsset(metadata.appPoster) };
export const license = { name: 'Apache-2.0', href: 'https://www.apache.org/licenses/LICENSE-2.0' };
export const websiteLabel = publicLink(appInfo.authorWebsite) ? new URL(appInfo.authorWebsite).hostname : 'Author website';
