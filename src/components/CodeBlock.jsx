import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
// language grammars used by the course (markup/clike/javascript ship with core import)
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-properties';

export default function CodeBlock({ lang = 'java', title, code }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code, lang]);

  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span>{title || ''}</span>
        <span style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <span className="codeblock-lang">{lang}</span>
          <button className="copy-btn" onClick={copy}>{copied ? 'copied!' : 'copy'}</button>
        </span>
      </div>
      <pre><code ref={ref} className={'language-' + lang}>{code}</code></pre>
    </div>
  );
}
