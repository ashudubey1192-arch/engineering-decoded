export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        addEventListener: "readonly",
        document: "readonly",
        innerHeight: "readonly",
        localStorage: "readonly",
        removeEventListener: "readonly",
        requestAnimationFrame: "readonly",
        scrollY: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
    },
  },
];
