# Contract: Page UI

**Applies to**: `src/index.html`, `src/js/app.js`
**Verified by**: `tests/contract/ui-contract.test.js` (structure) and
`tests/integration/*.test.js` (behavior)

This is the interface visitors and assistive technology rely on. Tests find elements by their
**role and accessible name**, or by the `data-testid` values listed here, never by CSS classes.
Changing a role, name, or `data-testid` is a contract change.

## Elements

| Element           | Markup / role                                | Accessible name / content                        | `data-testid`     |
|-------------------|----------------------------------------------|--------------------------------------------------|-------------------|
| Page heading      | `<h1>`                                       | "Quote of the Day"                               | –                 |
| Quote region      | `<figure>` with `aria-live="polite"`         | Contains the quote text and author               | `quote`           |
| Quote text        | `<blockquote>` inside the figure             | The quote's `text`                               | `quote-text`      |
| Quote author      | `<figcaption>` inside the figure             | `— ` followed by the quote's `author`            | `quote-author`    |
| New quote button  | `<button type="button">`                     | "New quote"                                      | `new-quote`       |
| Favorite toggle   | `<button type="button" aria-pressed>`        | "Add to favorites" when not pressed, "Remove from favorites" when pressed | `favorite-toggle` |
| Favorites section | `<section>` with an `<h2>`                   | Heading "Your favorites"                         | `favorites`       |
| Favorites list    | `<ol>` inside the section                    | One `<li>` per favorite, oldest first            | `favorites-list`  |
| Favorite item     | `<li>` with quote text, author, and a button | Button name: "Remove from favorites: " followed by the first 40 characters of the quote | `favorite-item`   |
| Empty message     | `<p>`, shown only when there are no favorites | "No favorites yet. Use “Add to favorites” on a quote you like." | `favorites-empty` |
| Storage notice    | `<p role="status">`, hidden unless in memory-only mode | "Your browser isn't letting this page save data, so favorites will be lost when you leave." | `storage-notice` |

## Behavior

| Trigger                                    | Result                                                         |
|--------------------------------------------|----------------------------------------------------------------|
| Page load                                  | Shows exactly one quote. The favorite toggle shows that quote's state. The favorites list is filled from storage. |
| Activate "New quote" (click, Enter, Space) | A different quote is shown (if more than one exists). The toggle updates. The page doesn't reload. Focus stays on the button. |
| Activate the favorite toggle               | Favorites the current quote, or removes it. `aria-pressed` and the label update. The list updates. The change is saved. |
| Activate "Remove" on a favorite item       | Removes it from the list and saves. If that quote is currently shown, the toggle switches to not pressed. Focus moves to the next item's Remove button, or the previous one if it was last, or the favorite toggle if the list is now empty. |
| Storage unavailable (memory-only mode)     | The storage notice is visible. Everything else works for this visit. |

## Layout

- No horizontal scrolling at a 320 px wide viewport, even for the longest quote.
- Every interactive element has a visible focus indicator.
- Text contrast is at least 4.5:1 (WCAG AA).
