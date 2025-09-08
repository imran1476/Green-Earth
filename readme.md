# ES6 Questions - Assignment-006

## 1) Difference between var, let, and const
- `var` → Function-scoped, redeclarable, hoisted.  
- `let` → Block-scoped, updatable, not redeclarable in same scope.  
- `const` → Block-scoped, cannot update or redeclare.

## 2) Difference between map(), forEach(), and filter()
- `forEach()` → Loops through array, returns nothing.  
- `map()` → Loops through array, returns a new array with transformed items.  
- `filter()` → Loops through array, returns a new array with items that satisfy a condition.

## 3) Arrow Functions in ES6
- Short syntax for functions: `(params) => expression`  
- Automatically binds `this`  
```javascript
const add = (a, b) => a + b;

## 4) How does destructuring assignment work in ES6?

**Destructuring assignment is an ES6 feature that allows values from an object or an array to be assigned directly to variables. 

### Example (Array):
```js
const fruits = ['Apple', 'Banana', 'Mango'];
const [first, second, third] = fruits;

console.log(first);  // Output: Apple
console.log(second); // Output: Banana
console.log(third);  // Output: Mango

## 5) Explain template literals in ES6. How are they different from string concatenation?

Template literals are a feature in ES6 that allow you to create strings in a more readable and convenient way.

They use backticks (`) instead of quotes.

Variables and expressions can be embedded using ${variable}.

They support multi-line strings.