// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { useId } from 'react';
import { LinkIcon, type LinkKind } from './LinkIcon';
import { publicLink } from './app-info';
function position(link: HTMLAnchorElement) {
  const tip = link.querySelector<HTMLElement>('[role="tooltip"]');
  if (!tip || !link.parentElement) return;
  const row = link.parentElement.getBoundingClientRect(); const box = link.getBoundingClientRect();
  const center = box.left - row.left + box.width / 2;
  const left = Math.max(0, Math.min(center - tip.offsetWidth / 2, row.width - tip.offsetWidth));
  tip.style.left = `${left}px`; tip.style.bottom = `${row.bottom - box.top + 10}px`;
  tip.style.setProperty('--tooltip-arrow', `${center - left}px`);
}
export function AboutLink({ href, label, description, kind }: { href: string; label: string; description: string; kind: LinkKind }) {
  const id = useId();
  if (!publicLink(href)) return null;
  return <a href={href} className={'about-link' + (kind === 'coffee' ? ' coffee-link' : '')} target="_blank" rel="noopener noreferrer" aria-label={label} aria-describedby={id} onPointerEnter={(e) => position(e.currentTarget)} onFocus={(e) => position(e.currentTarget)}>
    <LinkIcon kind={kind} />{label}
    <span id={id} className="link-tooltip" role="tooltip"><span>{description}</span><span className="tooltip-url">{href}</span></span>
  </a>;
}
