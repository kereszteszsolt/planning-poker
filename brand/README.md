# PointFlip branding

[`branding.json`](branding.json) follows the TypeNudge display-branding contract. Edit project metadata here. It contains no credentials or runtime provider configuration.

The field order below is shared by every repository using this branding structure. Keep the JSON keys in exactly this order and preserve all field values when reordering them.

| Field | Meaning |
| --- | --- |
| `appName` | Display name |
| `appTagline` | Project tagline |
| `appDescription` | Project description |
| `appWebsite` | Project website; empty when none is configured |
| `appGithubUrl` | Project repository |
| `appFavicon` | Optional local favicon |
| `appIcon` | Optional local project mark |
| `appPoster` | Optional local project poster |
| `authorName` | Author display name |
| `authorWebsite` | Author website |
| `authorWebsiteLanguages` | Ordered language codes for the author website |
| `authorGithub` | Author GitHub profile |
| `authorWaysToSupportUrl` | General ways to support the author |
| `authorBuyMeACoffeeUrl` | Direct Buy Me a Coffee link |
| `supportRemarkText` | Voluntary-support notice |

Asset paths are relative to this `brand/` directory and must stay inside `assets/`. Empty paths mean no image. These are source paths, not public URLs: consumers must package or map them to their own public base. Do not fetch remote artwork or resolve arbitrary filesystem paths.

The SVG and PNG posters are unchanged copies of `kereszteszsolt/project-cards/point-flip-poster.*` from the profile repository. `appPoster` selects the vector version; the PNG is the social-preview alternative. The SVG mark is copied from `readme-assets/planning-poker-mark.svg`. The existing estimation-card mark is retained; it is not declared as a tested browser favicon. Preserve original artwork when adding variants.

The root catalog is consumed by the application metadata adapter for the header, title/favicon, About poster/description/project/support links and author attribution. Consuming implementation uses functional app-info/About names. Copyright follows the current year and the legal license stays separate. Optional empty artwork and destinations are omitted. Original assets are packaged locally without remote image requests.

No extra JSON fields are needed for this project.

License identifiers and URLs are not part of the branding contract. The legal source of truth remains the root `LICENSE` and existing SPDX notices; branding edits must not rewrite those or rename stable storage/package identifiers.
