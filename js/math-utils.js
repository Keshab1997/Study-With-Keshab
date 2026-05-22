function latexToHtml(latex) {
  let result = latex;

  let prev;
  do {
    prev = result;
    result = result.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) =>
      `<span class="fraction"><span class="top">${num.trim()}</span><span class="bottom">${den.trim()}</span></span>`
    );
  } while (result !== prev);

  result = result
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  result = result
    .replace(/\^\{([^}]+)\}/g, (_, e) => `<sup>${e}</sup>`)
    .replace(/\^(\w)/g, (_, e) => `<sup>${e}</sup>`)
    .replace(/_\{([^}]+)\}/g, (_, e) => `<sub>${e}</sub>`)
    .replace(/_(\w)/g, (_, e) => `<sub>${e}</sub>`);

  result = result
    .replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|lim|max|min)\b/g, '$1')
    .replace(/\\theta/g, 'θ').replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ').replace(/\\delta/g, 'δ').replace(/\\pi/g, 'π')
    .replace(/\\phi/g, 'φ').replace(/\\omega/g, 'ω').replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ').replace(/\\sigma/g, 'σ')
    .replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠').replace(/\\approx/g, '≈').replace(/\\infty/g, '∞')
    .replace(/\\left[\(\[{]/g, '(').replace(/\\right[\)\]}]/g, ')')
    .replace(/\\left\./g, '').replace(/\\right\./g, '');

  result = result
    .replace(/\{([^{}]*)\}/g, '$1')
    .replace(/\\\\/g, '<br>').replace(/\\_/g, '_').replace(/\\,/g, ' ')
    .replace(/\s+/g, ' ').trim();

  return result;
}

function processInlineMath(text) {
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) =>
    `<div class="math-block">${latexToHtml(m.trim())}</div>`
  );
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) =>
    `<span class="math-inline">${latexToHtml(m.trim())}</span>`
  );

  text = text.replace(/(\\frac\{[^}]+\}\{[^}]+\}|\\text\{[^}]*\}|\\times|\\div|\\cdot|\\pm|\\sqrt\{[^}]*\})/g, (m) =>
    latexToHtml(m)
  );

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>');
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');

  text = text.replace(/\b(\d+)\/(\d+)\b/g, (match, num, den) => {
    if (den.length <= 3 && num.length <= den.length + 1) {
      return `<span class="fraction"><span class="top">${num}</span><span class="bottom">${den}</span></span>`;
    }
    return match;
  });

  return text;
}

function renderContent(text) {
  if (!text) return '';
  return processInlineMath(text).replace(/\n/g, '<br>');
}
