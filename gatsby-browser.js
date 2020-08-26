require('./src/stylesheets/prism.css')
require('prismjs/plugins/line-numbers/prism-line-numbers.css')

exports.onInitialClientRender = () => {
  require('typeface-inter')
}
