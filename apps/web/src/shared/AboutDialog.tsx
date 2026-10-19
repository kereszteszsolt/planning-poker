// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { useId, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { appInfo, publicLink, websiteLabel } from './app-info';
import { AboutLink } from './AboutLink';
import { AuthorAttribution } from './AuthorAttribution';
import { LinkIcon } from './LinkIcon';
export function AboutDialog({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const title = useId(); const description = useId();
  const languages = appInfo.authorWebsiteLanguages.join(' | ');
  const hasSupport = publicLink(appInfo.authorBuyMeACoffeeUrl) || publicLink(appInfo.authorWaysToSupportUrl);
  return <dialog ref={dialogRef} className="about-dialog" aria-labelledby={title} aria-describedby={description} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const b = event.currentTarget.getBoundingClientRect();
    if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) event.currentTarget.close();
  }}>
    <div className="about-heading"><h2 id={title}>About {appInfo.appName}</h2><button className="about-close" type="button" aria-label="Close about" autoFocus onClick={() => dialogRef.current?.close()}>×</button></div>
    {appInfo.poster && <img className="about-poster" src={appInfo.poster} alt={`${appInfo.appName} project poster`} width="780" height="480" />}
    <p id={description} className="about-description">{appInfo.appDescription}</p>
    <nav className="about-links" aria-label="Project and author links">
      <AboutLink href={appInfo.authorWebsite} label={websiteLabel} description={`About ${appInfo.authorName}, projects and contact. Available in ${languages}.`} kind="globe" />
      <AboutLink href={appInfo.appWebsite} label="Project website" description="Visit the project website." kind="globe" />
      <AboutLink href={appInfo.appGithubUrl} label="Source" description={`Source code for ${appInfo.appName}.`} kind="code" />
      <AboutLink href={appInfo.authorGithub} label="GitHub profile" description={`Explore ${appInfo.authorName}'s projects.`} kind="user" />
    </nav>
    {hasSupport && <nav className="about-links about-support-links" aria-label="Support the author">
      <AboutLink href={appInfo.authorBuyMeACoffeeUrl} label="Buy me a Coffee" description={`Support ${appInfo.authorName} on Buy Me a Coffee.`} kind="coffee" />
      <AboutLink href={appInfo.authorWaysToSupportUrl} label="Ways to support" description={`Ways to support ${appInfo.authorName}'s work.`} kind="heart" />
    </nav>}
    <p className="about-details"><Link to="/about" onClick={() => dialogRef.current?.close()}>Project details and privacy</Link></p>
    {hasSupport && appInfo.supportRemarkText && <div className="about-support-note" role="note"><LinkIcon kind="info" /><p>{appInfo.supportRemarkText}</p></div>}
    <AuthorAttribution website={false} />
  </dialog>;
}
