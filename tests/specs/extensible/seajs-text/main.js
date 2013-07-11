
seajs.config({
  base: './seajs-text/',
  preload: ["../../../../seajs-text/dist/seajs-text"],

  // DO NOT affect plugin files
  // https://github.com/seajs/seajs-text/issues/2
  map: [
    [/(\/[a-z]\.\w+\.js)$/, '$1?zzz']
  ]
})

seajs.use('init')

