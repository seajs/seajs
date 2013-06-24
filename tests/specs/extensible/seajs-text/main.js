
seajs.config({
  alias: {
    'd': 'path/to/d.json'
  },
  preload: ["../../../../seajs-text/dist/seajs-text"]
})

seajs.use('./seajs-text/init')

