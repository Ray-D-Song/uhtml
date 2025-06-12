import { render, html } from '../esm/index.js';

// Test sparse attributes functionality
const container = document.createElement('div');
document.body.appendChild(container);

// Test 1: Basic sparse attribute
console.log('Test 1: Basic sparse attribute');
const prefix = 'data-';
const id = 'test-id';
const suffix = '-end';

render(container, html`
  <div class="${prefix}${id}${suffix}">Basic sparse attribute</div>
`);

const element1 = container.querySelector('div');
console.log('Expected class: data-test-id-end');
console.log('Actual class:', element1.className);
console.log('Test 1 passed:', element1.className === 'data-test-id-end');

// Test 2: Multiple interpolations
console.log('\nTest 2: Multiple interpolations');
const part1 = 'hello';
const part2 = 'world';
const part3 = 'test';

render(container, html`
  <div data-value="${part1}-${part2}-${part3}">Multiple interpolations</div>
`);

const element2 = container.querySelector('div[data-value]');
console.log('Expected data-value: hello-world-test');
console.log('Actual data-value:', element2.getAttribute('data-value'));
console.log('Test 2 passed:', element2.getAttribute('data-value') === 'hello-world-test');

// Test 3: Mixed attributes (sparse and regular)
console.log('\nTest 3: Mixed attributes');
const sparseAttr = 'sparse';
const sparseValue = 'value';
const regularAttr = 'regular';

render(container, html`
  <div 
    class="${sparseAttr}-${sparseValue}" 
    id="${regularAttr}">
    Mixed attributes
  </div>
`);

const element3 = container.querySelector('div[id="regular"]');
console.log('Expected class: sparse-value');
console.log('Actual class:', element3.className);
console.log('Expected id: regular');
console.log('Actual id:', element3.id);
console.log('Test 3 passed:', element3.className === 'sparse-value' && element3.id === 'regular');

// Test 4: Dynamic updates
console.log('\nTest 4: Dynamic updates');
let dynamic1 = 'first';
let dynamic2 = 'second';

function updateTest() {
  render(container, html`
    <div title="${dynamic1}-${dynamic2}">Dynamic updates</div>
  `);
}

updateTest();
const element4 = container.querySelector('div[title]');
console.log('Initial title:', element4.getAttribute('title'));

dynamic1 = 'updated';
dynamic2 = 'values';
updateTest();
console.log('Updated title:', element4.getAttribute('title'));
console.log('Test 4 passed:', element4.getAttribute('title') === 'updated-values');

// Test 5: Empty and null values
console.log('\nTest 5: Empty and null values');
const empty = '';
const nullValue = null;
const undefinedValue = undefined;

render(container, html`
  <div data-test="${empty}${nullValue}${undefinedValue}">Empty values</div>
`);

const element5 = container.querySelector('div[data-test]');
console.log('Expected data-test: (empty string)');
console.log('Actual data-test:', element5.getAttribute('data-test'));
console.log('Test 5 passed:', element5.getAttribute('data-test') === '');

console.log('\n=== Sparse Attributes Test Results ===');
console.log('All tests completed. Check individual test results above.'); 