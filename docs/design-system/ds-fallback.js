// Resolves the K.Y.S component namespace: uses the compiled _ds_bundle.js when present,
// otherwise transpiles components/*.jsx in the browser (requires React + Babel standalone).
(function () {
  const root = document.currentScript.src.replace(/ds-fallback\.js.*$/, '');
  const FILES = ['core/Icon','core/Button','core/IconButton','forms/TextField','forms/SearchField','forms/Select','forms/Checkbox','forms/Slider',
    'vault/CategoryIcon','vault/FilterChip','vault/PasswordRow','vault/SecretField','vault/StatCard','navigation/TitleBar','navigation/NavRail','feedback/Toast','feedback/Alert'];
  const find = () => { for (const k of Object.keys(window)) { try { const v = window[k]; if (v && typeof v === 'object' && v.PasswordRow && v.Button) return v; } catch (e) {} } };
  window.KYS_READY = (async () => {
    let ns = find();
    if (!ns) {
      const r = await fetch(root + '_ds_bundle' + '.js', { method: 'HEAD' }).catch(() => null);
      if (r && r.ok) await new Promise(res => { const el = document.createElement('script'); el.src = root + '_ds_bundle' + '.js'; el.onload = el.onerror = res; document.head.appendChild(el); });
      ns = find();
    }
    if (ns) return (window.KYS_NS = ns);
    const names = []; let src = 'const { useState, useEffect, useRef } = React;\n';
    for (const f of FILES) {
      let t = await (await fetch(root + 'components/' + f + '.jsx')).text();
      const local = [];
      t = t.replace(/^import .*$/gm, '').replace(/export (function|const) (\w+)/g, (m, kw, n) => { local.push(n); return kw + ' ' + n; });
      src += 'var {' + local.join(',') + '} = (() => {\n' + t + '\nreturn {' + local.join(',') + '};\n})();\n';
      names.push(...local);
    }
    src += 'return {' + names.join(',') + '};';
    const code = Babel.transform(src, { presets: ['react'], parserOpts: { allowReturnOutsideFunction: true } }).code;
    return (window.KYS_NS = new Function('React', code)(React));
  })();
})();
