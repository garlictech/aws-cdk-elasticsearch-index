let common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require features/step_definitions/**/*.ts',
].join(' ');

module.exports = {
  default: common,
};
