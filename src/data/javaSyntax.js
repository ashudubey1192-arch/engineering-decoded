// One lexical pass keeps strings and comments intact; React escapes every token.
export function tokenizeJava(source) {
  const tokens = source.match(/"""[\s\S]*?"""|\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?[fFdDlL]?\b|[A-Za-z_$][\w$]*|[\s\S]/g) || [];
  return tokens.map(value => {
    let kind = 'plain';
    if (/^\/[/\*]/.test(value)) kind = 'comment';
    else if (/^["']/.test(value)) kind = 'string';
    else if (/^\d/.test(value)) kind = 'number';
    else if (/^(?:throw|throws|catch)$|(?:Exception|Error)$/.test(value)) kind = 'error';
    else if (/^(?:abstract|assert|boolean|break|byte|case|char|class|continue|default|do|double|else|enum|extends|false|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|record|return|sealed|short|static|super|switch|synchronized|this|transient|true|try|var|void|volatile|while|yield)$/.test(value)) kind = 'keyword';
    else if (/^[A-Z]/.test(value)) kind = 'type';
    return [kind, value];
  });
}
