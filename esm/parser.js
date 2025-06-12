import { COMMENT_NODE, ELEMENT_NODE } from 'domconstants/constants';
import { TEXT_ELEMENTS } from 'domconstants/re';
import parser from '@webreflection/uparser';

import { empty, isArray, set } from './utils.js';
import { abc } from './literals.js';

import { array, attribute, hole, text, removeAttribute } from './handler.js';
import createContent from './create-content.js';

/** @typedef {import("./literals.js").Entry} Entry */

/**
 * @typedef {Object} Resolved
 * @param {DocumentFragment} f content retrieved from the template
 * @param {Entry[]} e entries per each hole in the template
 * @param {boolean} d direct node to handle
 */

/**
 * @param {Element} node
 * @returns {number[]}
 */
const createPath = node => {
  const path = [];
  let parentNode;
  while ((parentNode = node.parentNode)) {
    path.push(path.indexOf.call(parentNode.childNodes, node));
    node = parentNode;
  }
  return path;
};

const textNode = () => document.createTextNode('');

// Extended abc function for sparse attributes
const abcde = (a, b, c, d = false, e = 1) => ({ a, b, c, d, e });

/**
 * @param {TemplateStringsArray} template
 * @param {boolean} xml
 * @returns {Resolved}
 */
const resolve = (template, values, xml) => {
  const content = createContent(parser(template, prefix, xml), xml);
  const { length } = template;
  let entries = empty;
  if (length > 1) {
    const replace = [];
    const tw = document.createTreeWalker(content, 1 | 128);
    let i = 0, search = `${prefix}${i++}`;
    entries = [];
    while (i < length) {
      const node = tw.nextNode();
      // these are holes or arrays
      if (node.nodeType === COMMENT_NODE) {
        if (node.data === search) {
          // ⚠️ once array, always array!
          const update = isArray(values[i - 1]) ? array : hole;
          if (update === hole) replace.push(node);
          entries.push(abc(createPath(node), update, null));
          search = `${prefix}${i++}`;
        }
      }
      else {
        let path;
        // these are attributes - check for sparse attributes
        const attributesToRemove = [];
        while (node.hasAttribute(search)) {
          if (!path) path = createPath(node);
          const name = node.getAttribute(search);
          
          // Check for sparse attributes by looking at the actual attribute value
          const actualAttr = node.getAttributeNode(name);
          let sparse = null;
          
          if (actualAttr && actualAttr.value.includes(prefix)) {
            // Split the attribute value to find all interpolations
            const parts = actualAttr.value.split(new RegExp(`${prefix}\\d+`));
            if (parts.length > 2) {
              // This is a sparse attribute with multiple interpolations
              sparse = parts;
              
              // Mark all related attribute nodes for removal
              const interpolationCount = parts.length - 1;
              attributesToRemove.push(search);
              
              // Add subsequent interpolation attributes to removal list
              for (let j = 1; j < interpolationCount; j++) {
                const nextSearch = `${prefix}${i + j}`;
                if (node.hasAttribute(nextSearch)) {
                  attributesToRemove.push(nextSearch);
                }
              }
              
              entries.push(abcde(path, attribute(node, name, xml, sparse), name, true, interpolationCount));
              
              // Advance i by the number of interpolations consumed
              i += interpolationCount;
              search = `${prefix}${i}`;
              break; // Exit the while loop for this node
            }
          }
          
          // Regular single interpolation attribute
          if (!sparse) {
            entries.push(abc(path, attribute(node, name, xml), name));
            attributesToRemove.push(search);
            search = `${prefix}${i++}`;
          }
        }
        
        // Remove all marked attributes
        attributesToRemove.forEach(attr => removeAttribute(node, attr));
        
        // these are special text-only nodes
        if (
          !xml &&
          TEXT_ELEMENTS.test(node.localName) &&
          node.textContent.trim() === `<!--${search}-->`
        ) {
          entries.push(abc(path || createPath(node), text, null));
          search = `${prefix}${i++}`;
        }
      }
    }
    // can't replace holes on the fly or the tree walker fails
    for (i = 0; i < replace.length; i++)
      replace[i].replaceWith(textNode());
  }

  // need to decide if there should be a persistent fragment
  const { childNodes } = content;
  let { length: len } = childNodes;

  // html`` or svg`` to signal an empty content
  // these nodes can be passed directly as never mutated
  if (len < 1) {
    len = 1;
    content.appendChild(textNode());
  }
  // html`${'b'}` or svg`${[]}` cases
  else if (
    len === 1 &&
    // ignore html`static` or svg`static` because
    // these nodes can be passed directly as never mutated
    length !== 1 &&
    childNodes[0].nodeType !== ELEMENT_NODE
  ) {
    // use a persistent fragment for these cases too
    len = 0;
  }

  return set(cache, template, abc(content, entries, len === 1));
};

/** @type {WeakMap<TemplateStringsArray, Resolved>} */
const cache = new WeakMap;
const prefix = 'isµ';

/**
 * @param {boolean} xml
 * @returns {(template: TemplateStringsArray, values: any[]) => Resolved}
 */
export default xml => (template, values) => cache.get(template) || resolve(template, values, xml);
