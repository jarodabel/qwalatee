module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '10.13' }}],
    '@babel/preset-typescript',
  ],
  plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],

};
