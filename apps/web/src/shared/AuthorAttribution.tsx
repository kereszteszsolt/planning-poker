// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { appInfo, license, publicLink, websiteLabel } from './app-info';
export function AuthorAttribution({ website = true }: { website?: boolean }) {
  return <div className="author-attribution">
    <span className="copyright-line">© {new Date().getFullYear()} {appInfo.authorName}, <a href={license.href} target="_blank" rel="noopener noreferrer">{license.name}</a></span>
    {website && publicLink(appInfo.authorWebsite) && <a className="author-website" href={appInfo.authorWebsite} target="_blank" rel="noopener noreferrer">{websiteLabel}</a>}
  </div>;
}
