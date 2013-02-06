
seajs.config({
  alias: {
    'd': 'path/to/d.json'
  },
  plugins: ['text']
})

seajs.use('./plugin-text/init')

