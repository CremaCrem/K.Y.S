Solid color tile + white glyph identifying a password's category (or a brand logo when known).
```jsx
<CategoryIcon category="wifi" />
<CategoryIcon category="dev" logo="github" brandColor="#181717" />
<CategoryIcon category="apikeys" size={72} />
```
- 19 categories incl. specialty: `servers`, `apikeys`, `licenses`, `recovery`, `crypto`, `smarthome`; `other` is the fallback.
- Radius scales with size (≈32%). Never tint the glyph — always white.
