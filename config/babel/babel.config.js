module.exports = {
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
    }],
    ['babel-plugin-transform-imports', {
      '@fortawesome/free-solid-svg-icons': {
        transform: (importName) => `@fortawesome/free-solid-svg-icons/${importName}`,
        preventFullImport: true,
        skipDefaultConversion: true,
      },
      '@fortawesome/pro-duotone-svg-icons': {
        transform: (importName) => `@fortawesome/pro-duotone-svg-icons/${importName}`,
        preventFullImport: true,
        skipDefaultConversion: true,
      },
      '@fortawesome/pro-light-svg-icons': {
        transform: (importName) => `@fortawesome/pro-light-svg-icons/${importName}`,
        preventFullImport: true,
        skipDefaultConversion: true,
      },
      '@fortawesome/pro-regular-svg-icons': {
        transform: (importName) => `@fortawesome/pro-regular-svg-icons/${importName}`,
        preventFullImport: true,
        skipDefaultConversion: true,
      },
      '@fortawesome/pro-solid-svg-icons': {
        transform: (importName) => `@fortawesome/pro-solid-svg-icons/${importName}`,
        preventFullImport: true,
        skipDefaultConversion: true,
      },
    }],
    'babel-plugin-styled-components',
  ],
  presets: [
    ['@babel/preset-env', {
      corejs: '3.9',
      targets: ['defaults', 'not ie > 0'],
      useBuiltIns: 'usage',
    }],
    '@babel/preset-flow',
    '@babel/preset-react',
  ],
};
