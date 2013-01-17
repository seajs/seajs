/**
 * The bootstrap and entrances
 */


// Assigns to global define.
global.define = define


// Loads the data-main module automatically.
config.main && seajs.use(config.main)


// For plugin developers
seajs.pluginSDK = {
  config: config,
  cachedModules: cachedModules,
  compilingStack: compilingStack,
  STATUS: STATUS
}
