
seajs.config({
  alias: {
    'd': 'path/to/d.json'
  },
  preload: ["../../../../../seajs/seajs-text/dist/seajs-text-debug"]
})

seajs.use('./seajs-text/init')

