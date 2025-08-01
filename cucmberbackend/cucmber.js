module.exports = {
  default: {
    require: [
      'step_definitions/**/*.js',
      'pageObjects/**/*.js'
    ],
    format: ['progress'],
    publishQuiet: true,
  },
};