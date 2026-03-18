# Recel Love Page

This project is a static romantic web page built with plain HTML, CSS, and JavaScript. It keeps the original pink glassmorphism theme while adding cleaner structure, richer interactivity, better accessibility, and stronger mobile behavior.

## Setup

1. Open `index.html` directly in a browser, or serve the folder with any simple static server.
2. Keep the existing asset paths intact:
   - `To The Bone.mp3`
   - `imgs/1.jpg` through `imgs/9.jpg`

No build step or package installation is required.

## Project Structure

- `index.html`
  Main semantic page structure, metadata, section content, and fallback markup.
- `styles.css`
  Theme variables, layout, responsive styles, animations, and component styling.
- `script.js`
  Interactive behavior, local storage, carousels, audio controls, toasts, and access-gate logic.
- `To The Bone.mp3`
  Background audio track.
- `imgs/`
  Photo gallery images used by the carousel.

## Features

- Semantic single-page layout with accessible sections and navigation
- Dark mode toggle with saved preference
- Improved audio player with play/pause, seek bar, current time, duration, volume persistence, and error handling
- Relationship counters and live relationship timer
- Expandable reasons and memories carousel
- Photo carousel built from the existing `imgs` folder
- Secret envelope message and gift reveal interaction
- Toast notifications for meaningful actions
- Button particle bursts, finale confetti, floating hearts, and subtle parallax movement
- Scroll reveal animations
- Local message board using `localStorage`
- Optional password protection gate
- Email sharing action with pre-filled `mailto:` draft
- Video embed placeholder section
- SEO metadata, Open Graph tags, and basic schema markup

## Customization Notes

Most of the editable content lives in either `index.html` or the config block near the top of `script.js`.

### Change important dates

Edit these values in `script.js`:

- `siteConfig.unlockDate`
- `siteConfig.knownSince`
- `siteConfig.togetherSince`

### Enable the password gate

In `script.js`, update:

- `siteConfig.passwordGate.enabled`
- `siteConfig.passwordGate.password`
- `siteConfig.passwordGate.hint`

This is only light privacy for a static site. It is not secure backend authentication.

### Add a video message

In `script.js`, set:

- `siteConfig.video.embedUrl`
- `siteConfig.video.title`

Use an embeddable URL from a provider like YouTube or Vimeo, or a direct embeddable video URL.

### Edit the email share message

In `script.js`, update:

- `siteConfig.emailShare.subject`
- `siteConfig.emailShare.body`

### Update reasons, captions, and text

- Edit the reasons and memory notes directly in the reasons section inside `index.html`
- Edit image captions in the photo gallery section inside `index.html`
- Edit the hero copy, gift message, envelope message, and section text in `index.html`

## Notes On Storage

`localStorage` is used for:

- theme preference
- audio volume
- gift and envelope open states
- mobile nav open state
- revealed reason progress
- saved local messages
- optional remembered password unlock state

If storage is blocked in the browser, the page still works, but preferences and local messages will not persist.

## Analytics Placeholder

`index.html` includes a tiny analytics placeholder:

- `window.lovePageAnalytics`

Replace that stub with your real analytics provider if you want tracking later.
