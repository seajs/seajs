
seajs.config({
  alias: {
    'd': 'path/to/d.json',
    'handlebars': 'gallery/handlebars/1.0.2/handlebars.js'
  },
  paths: {
    'gallery': 'https://a.alipayobjects.com/gallery'
  },
  preload: ["../../../../seajs-text/dist/seajs-text"]
})

seajs.use('./seajs-text/init')

