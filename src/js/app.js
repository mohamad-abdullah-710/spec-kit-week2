import { QUOTES } from './quotes.js';
import { pickRandomQuote } from './quote-picker.js';
import { createFavoritesStore } from './favorites-store.js';

/** @typedef {import('./quotes.js').Quote} Quote */

const REMOVE_LABEL_CHARS = 40;

/**
 * Builds one favorites-list item. Uses textContent only, never innerHTML.
 * @param {Document} document
 * @param {Quote} quote
 * @returns {HTMLLIElement}
 */
function createFavoriteItem(document, quote) {
  const item = document.createElement('li');
  item.dataset.testid = 'favorite-item';
  item.dataset.quoteId = quote.id;

  const text = document.createElement('blockquote');
  text.textContent = quote.text;
  const author = document.createElement('p');
  author.textContent = `— ${quote.author}`;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.setAttribute(
    'aria-label',
    `Remove from favorites: ${quote.text.slice(0, REMOVE_LABEL_CHARS)}`,
  );

  item.append(text, author, remove);
  return item;
}

/**
 * Looks up the page elements (by data-testid, per contracts/ui-contract.md) and returns
 * functions that draw state onto them. Holds no state of its own.
 * @param {Document} document
 */
function createView(document) {
  const byTestId = (id) => document.querySelector(`[data-testid="${id}"]`);
  const els = {
    quoteText: byTestId('quote-text'),
    quoteAuthor: byTestId('quote-author'),
    newQuote: byTestId('new-quote'),
    favoriteToggle: byTestId('favorite-toggle'),
    favoritesList: byTestId('favorites-list'),
    favoritesEmpty: byTestId('favorites-empty'),
    storageNotice: byTestId('storage-notice'),
  };

  return {
    els,
    /**
     * Only call when the displayed quote changes: the quote is an aria-live region, so
     * rewriting it would make screen readers read it out again.
     * @param {Quote} quote
     */
    renderQuote(quote) {
      els.quoteText.textContent = quote.text;
      els.quoteAuthor.textContent = `— ${quote.author}`;
    },
    /** @param {boolean} isFavorite */
    renderFavoriteToggle(isFavorite) {
      els.favoriteToggle.setAttribute('aria-pressed', String(isFavorite));
      els.favoriteToggle.textContent = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    },
    /** @param {Quote[]} favorites @param {boolean} memoryOnly */
    renderFavorites(favorites, memoryOnly) {
      els.favoritesList.replaceChildren(...favorites.map((q) => createFavoriteItem(document, q)));
      els.favoritesEmpty.hidden = favorites.length > 0;
      els.storageNotice.hidden = !memoryOnly;
    },
    /** Focuses the next item's Remove button, else the previous one, else the toggle. */
    focusAfterRemove(removedIndex) {
      const buttons = els.favoritesList.querySelectorAll('button');
      (buttons[Math.min(removedIndex, buttons.length - 1)] ?? els.favoriteToggle).focus();
    },
  };
}

/**
 * Wires the page to the quote logic. Contains no decisions of its own: all choices are
 * made by quote-picker.js and favorites-store.js.
 * @param {{
 *   document: Document,
 *   storage: Storage | null,
 *   random?: () => number,
 *   quotes?: ReadonlyArray<Quote>,
 * }} deps - `storage` is null when the browser blocks localStorage.
 * @returns {void}
 */
export function initApp({ document, storage, random = Math.random, quotes = QUOTES }) {
  const view = createView(document);
  const quotesById = new Map(quotes.map((quote) => [quote.id, quote]));
  const store = createFavoritesStore({ storage, validIds: [...quotesById.keys()] });
  let currentQuote = pickRandomQuote(quotes, { random });

  const renderFavoritesState = () => {
    view.renderFavoriteToggle(store.has(currentQuote.id));
    const favorites = store.list().map((id) => quotesById.get(id));
    view.renderFavorites(favorites, store.mode === 'memory-only');
  };

  view.els.newQuote.addEventListener('click', () => {
    currentQuote = pickRandomQuote(quotes, { excludeId: currentQuote.id, random });
    view.renderQuote(currentQuote);
    view.renderFavoriteToggle(store.has(currentQuote.id));
  });

  view.els.favoriteToggle.addEventListener('click', () => {
    store.toggle(currentQuote.id);
    renderFavoritesState();
  });

  view.els.favoritesList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button === null) {
      return;
    }
    const { quoteId } = button.closest('li').dataset;
    const removedIndex = store.list().indexOf(quoteId);
    store.remove(quoteId);
    renderFavoritesState();
    view.focusAfterRemove(removedIndex);
  });

  view.renderQuote(currentQuote);
  renderFavoritesState();
}
