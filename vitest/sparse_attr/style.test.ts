import { test, expect } from 'vitest'

test('sparse attribute style', () => {
  const div = document.createElement('div');
  div.setAttribute('style', 'color: red;');
  expect(div.getAttribute('style')).toBe('color: red;');
});