const config = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['custom-variant'],
      },
    ],
    'import-notation': null,
  },
}

export default config
