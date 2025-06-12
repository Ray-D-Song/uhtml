import { PersistentFragment } from './persistent-fragment.js';
import { bc, detail } from './literals.js';
import { array, hole } from './handler.js';
import { empty, find } from './utils.js';
import { cache } from './literals.js';

/** @param {(template: TemplateStringsArray, values: any[]) => import("./parser.js").Resolved} parse */
export default parse => (
  /**
   * @param {TemplateStringsArray} template
   * @param {any[]} values
   * @returns {import("./literals.js").Cache}
   */
  (template, values) => {
    const { a: fragment, b: entries, c: direct } = parse(template, values);
    const root = document.importNode(fragment, true);
    /** @type {import("./literals.js").Detail[]} */
    let details = empty;
    if (entries !== empty) {
      details = [];
      for (let current, prev, i = 0; i < entries.length; i++) {
        const { a: path, b: update, c: name, d: sparse, e: sparseCount } = entries[i];
        const node = path === prev ? current : (current = find(root, (prev = path)));
        details[i] = detail(
          update,
          node,
          name,
          update === array ? [] : (update === hole ? cache() : null),
          sparse || false,
          sparseCount || 1
        );
      }
    }
    return bc(
      direct ? root.firstChild : new PersistentFragment(root),
      details,
    );
  }
);
