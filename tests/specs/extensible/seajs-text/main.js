
seajs.config({
  base: './seajs-text/',
  alias: {
    'd': 'path/to/d.json'
  },
  preload: ["../../../../seajs-text/dist/seajs-text"]
})

seajs.use('init')

