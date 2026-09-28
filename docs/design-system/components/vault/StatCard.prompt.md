Muted card with a large colored number — vault health (Total, Weak, Reused, Old).
```jsx
<StatCard value={12} label="Total passwords" />
<StatCard value={2} label="Weak" tone="danger" onClick={() => setFilter('weak')} />
```
- Use on a dedicated Health view; keep the main vault list uncluttered.
