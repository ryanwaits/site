/**
 * Custom CodeHike theme using CSS variables for light/dark mode support.
 * Colors are defined in globals.css as --ch-* variables.
 */
const theme = {
  name: 'site-theme',
  type: 'from-css',
  tokenColors: [
    // Comments
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: 'var(--ch-comment)', fontStyle: 'italic' },
    },
    // Strings
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: 'var(--ch-string)' },
    },
    // Keywords
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator',
        'storage',
        'storage.type',
        'storage.modifier',
      ],
      settings: { foreground: 'var(--ch-keyword)' },
    },
    // Functions
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
      ],
      settings: { foreground: 'var(--ch-function)' },
    },
    // Types and Classes
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
      ],
      settings: { foreground: 'var(--ch-type)' },
    },
    // Variables and Parameters
    {
      scope: [
        'variable',
        'variable.parameter',
        'variable.other',
        'meta.definition.variable',
      ],
      settings: { foreground: 'var(--ch-variable)' },
    },
    // Properties
    {
      scope: [
        'variable.other.property',
        'support.type.property-name',
        'meta.object-literal.key',
      ],
      settings: { foreground: 'var(--ch-property)' },
    },
    // Numbers and Constants
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'support.constant',
      ],
      settings: { foreground: 'var(--ch-number)' },
    },
    // Punctuation
    {
      scope: [
        'punctuation',
        'meta.brace',
        'meta.bracket',
      ],
      settings: { foreground: 'var(--ch-punctuation)' },
    },
    // Operators
    {
      scope: ['keyword.operator', 'punctuation.accessor'],
      settings: { foreground: 'var(--ch-punctuation)' },
    },
    // JSX/HTML Tags
    {
      scope: [
        'entity.name.tag',
        'support.class.component',
        'punctuation.definition.tag',
      ],
      settings: { foreground: 'var(--ch-tag)' },
    },
    // Attributes
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: 'var(--ch-attr)' },
    },
    // JSON keys
    {
      scope: ['support.type.property-name.json'],
      settings: { foreground: 'var(--ch-property)' },
    },
    // Regex
    {
      scope: ['string.regexp'],
      settings: { foreground: 'var(--ch-string)' },
    },
    // Shell/Bash
    {
      scope: ['source.shell', 'source.bash'],
      settings: { foreground: 'var(--ch-text)' },
    },
    {
      scope: ['comment.line.number-sign.shell'],
      settings: { foreground: 'var(--ch-comment)', fontStyle: 'italic' },
    },
    // Default/fallback
    {
      scope: ['source', 'text'],
      settings: { foreground: 'var(--ch-text)' },
    },
  ],
  colors: {
    // Editor background and foreground
    'editor.background': 'var(--ch-bg)',
    'editor.foreground': 'var(--ch-text)',
    // Selection
    'editor.selectionBackground': 'var(--ch-selection)',
    // Line numbers
    'editorLineNumber.foreground': 'var(--ch-line-number)',
    // Tabs
    'tab.activeBackground': 'var(--ch-bg)',
    'tab.inactiveBackground': 'var(--ch-tabs-bg)',
    'tab.activeForeground': 'var(--ch-text)',
    'tab.inactiveForeground': 'var(--ch-muted)',
    // Border
    'tab.border': 'var(--ch-border)',
  },
};

export default theme;
