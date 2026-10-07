/**
 * @typedef {{ id: string, text: string, author: string }} Quote
 */

/**
 * The built-in quote collection. IDs are permanent: saved favorites refer to them,
 * so never change or reuse an ID once shipped.
 * @type {ReadonlyArray<Readonly<Quote>>}
 */
export const QUOTES = Object.freeze(
  [
    {
      id: 'q-001',
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    },
    {
      id: 'q-002',
      text: 'Simplicity is prerequisite for reliability.',
      author: 'Edsger W. Dijkstra',
    },
    {
      id: 'q-003',
      text: 'Whether you think you can, or you think you can’t — you’re right.',
      author: 'Henry Ford',
    },
    {
      id: 'q-004',
      text: 'It does not matter how slowly you go as long as you do not stop.',
      author: 'Confucius',
    },
    {
      id: 'q-005',
      text: 'The journey of a thousand miles begins with a single step.',
      author: 'Lao Tzu',
    },
    {
      id: 'q-006',
      text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
      author: 'Harold Abelson',
    },
    {
      id: 'q-007',
      text: 'Be the change that you wish to see in the world.',
      author: 'Unknown',
    },
    {
      id: 'q-008',
      text: 'Talk is cheap. Show me the code.',
      author: 'Linus Torvalds',
    },
    {
      id: 'q-009',
      text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Will Durant',
    },
    {
      id: 'q-010',
      text: 'Premature optimization is the root of all evil.',
      author: 'Donald Knuth',
    },
    {
      id: 'q-011',
      text: 'Life is what happens when you’re busy making other plans.',
      author: 'John Lennon',
    },
    {
      id: 'q-012',
      text:
        'It is not the critic who counts; not the man who points out how the strong man ' +
        'stumbles, or where the doer of deeds could have done them better. The credit ' +
        'belongs to the man who is actually in the arena, whose face is marred by dust ' +
        'and sweat and blood; who strives valiantly; who errs, who comes short again and ' +
        'again, because there is no effort without error and shortcoming.',
      author: 'Theodore Roosevelt',
    },
    {
      id: 'q-013',
      text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
      author: 'Martin Fowler',
    },
    {
      id: 'q-014',
      text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
      author: 'Unknown',
    },
  ].map((quote) => Object.freeze(quote)),
);
