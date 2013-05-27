
seajs.config({
  base: "./combo-long/",

  plugins: ["combo"],
  comboSyntax: ['', '+']
})

seajs.config({
  comboMaxLength: (seajs.config.data.base + 'a.js+b.js').length
})

seajs.use("init")

