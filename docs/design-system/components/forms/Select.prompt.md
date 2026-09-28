Native select styled to match TextField; used for Category.
```jsx
<Select label="Category" options={Object.entries(CATEGORIES).map(([value, c]) => ({ value, label: c.label }))} />
```
