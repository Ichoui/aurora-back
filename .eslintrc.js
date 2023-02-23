module.exports = {

  "root": true,
    "ignorePatterns": ["**/*"],
    "overrides": [
  {
    "files": ["*.ts", "*.tsx", "*.js", "*.jsx"]

  },
  {
    "files": ["*.ts", "*.tsx"],
    "rules": {}
  },
  {
    "files": ["*.js", "*.jsx"],
    "rules": {}
  },
  {
    "files": ["*.ts"],
    "rules": {
      "@angular-eslint/no-conflicting-lifecycle": "error",
      "@angular-eslint/no-host-metadata-property": "error",
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": ["warn"],
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/explicit-member-accessibility": [
        "off",
        {
          "accessibility": "explicit"
        }
      ],
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "default",
          "format": ["camelCase"]
        },
        {
          "selector": "variable",
          "format": ["camelCase"]
        },
        {
          "selector": "variable",
          "modifiers": ["global"],
          "format": ["camelCase", "UPPER_CASE"]
        },
        {
          "selector": "memberLike",
          "modifiers": ["private"],
          "format": ["camelCase"],
          "leadingUnderscore": "require"
        },
        {
          "selector": "classMethod",
          "modifiers": ["private"],
          "format": ["camelCase"],
          "leadingUnderscore": "require"
        },
        {
          "selector": "classMethod",
          "modifiers": ["protected"],
          "format": ["camelCase"],
          "leadingUnderscore": "require"
        },
        {
          "selector": "objectLiteralProperty",
          "format": ["camelCase"]
        },
        {
          "selector": "enum",
          "format": ["PascalCase"]
        },
        {
          "selector": "enumMember",
          "format": ["UPPER_CASE"]
        },
        {
          "selector": "class",
          "format": ["PascalCase"]
        },
        {
          "selector": "classMethod",
          "format": ["camelCase"]
        },
        {
          "selector": "interface",
          "format": ["PascalCase"]
        },
        {
          "selector": "typeParameter",
          "format": ["UPPER_CASE"]
        },
        {
          "selector": "typeProperty",
          "format": ["camelCase"]
        },
        {
          "selector": "classProperty",
          "format": ["camelCase", "UPPER_CASE"],
          "leadingUnderscore": "forbid"
        },
        {
          "selector": "classProperty",
          "format": ["camelCase", "UPPER_CASE"],
          "modifiers": ["private"],
          "leadingUnderscore": "require"
        },
        {
          "selector": "classProperty",
          "format": ["camelCase"],
          "modifiers": ["protected"],
          "leadingUnderscore": "require"
        },
        {
          "selector": "typeAlias",
          "format": ["PascalCase"]
        }
      ],
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-inferrable-types": [
        "error",
        {
          "ignoreParameters": true
        }
      ],
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/unified-signatures": "error",
      "arrow-body-style": "error",
      "constructor-super": "error",
      "curly": "error",
      "eqeqeq": ["error", "smart"],
      "guard-for-in": "error",
      "id-blacklist": "off",
      "id-match": "off",
      "import/no-deprecated": "warn",
      "no-bitwise": "error",
      "no-caller": "error",
      "no-console": [
        "error",
        {
          "allow": [
            "warn",
            "dir",
            "timeLog",
            "assert",
            "clear",
            "count",
            "countReset",
            "group",
            "groupEnd",
            "table",
            "info",
            "dirxml",
            "error",
            "groupCollapsed",
            "Console",
            "profile",
            "profileEnd",
            "timeStamp",
            "context"
          ]
        }
      ],
      "no-debugger": "error",
      "no-empty": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-new-wrappers": "error",
      "no-restricted-imports": ["error", "rxjs/Rx"],
      "no-shadow": "off",
      "no-throw-literal": "error",
      "no-undef-init": "error",
      "no-underscore-dangle": "off",
      "no-var": "error",
      "prefer-const": "error",
      "radix": "off"
    }
  },
  {
    "files": ["*.html"],
    "rules": {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/no-negated-async": "off",
      "no-extra-boolean-cast": "off"
    },
    "plugins": ["@angular-eslint/eslint-plugin-template"]
  }
]
};



