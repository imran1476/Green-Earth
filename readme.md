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