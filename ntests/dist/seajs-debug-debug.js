(function(){
seajs.importStyle("@font-face {    font-family: 'fontello';    src: url('https://i.alipayobjects.com/common/fonts/seajs-debug/fontello.eot');    src: url('https://i.alipayobjects.com/common/fonts/seajs-debug/fontello.eot#iefix') format('embedded-opentype'), /* IE6-IE8 */ url('https://i.alipayobjects.com/common/fonts/seajs-debug/fontello.woff') format('woff'),  /* chrome 6+、firefox 3.6+、Safari5.1+、Opera 11+ */ url('https://i.alipayobjects.com/common/fonts/seajs-debug/fontello.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+ */ url('https://i.alipayobjects.com/common/fonts/seajs-debug/fontello.svg') format('svg'); /* iOS 4.1- */    font-weight: normal;    font-style: normal;}#seajs-debug-console #seajs-debug-status button,#seajs-debug-console #seajs-debug-meta button,#seajs-debug-console #seajs-debug-map button {    font-family: 'fontello';}#seajs-debug-console, #seajs-debug-console * {    margin: 0;    padding: 0;    border: none;    font: 14px/1.2 Arial}#seajs-debug-console {    position: fixed;    width: 520px;    right: 10px;    bottom: 10px;    border: 2px solid #564F8A;    z-index: 2147483647;    background: #fafafa;}#seajs-debug-console a, #seajs-debug-console a:hover, #seajs-debug-console a:active, #seajs-debug-console a:link {    text-decoration: none;}#seajs-debug-console button {    border: none;    background: transparent;    cursor: pointer;    -webkit-user-select: none;    -moz-user-select: none;    -ms-user-select: none;    -o-user-select: none;    user-select: none;}#seajs-debug-console #seajs-debug-header,#seajs-debug-console #seajs-debug-editor,#seajs-debug-console #seajs-debug-map,#seajs-debug-console #seajs-debug-health {    border: none;    border-bottom: 1px solid lightgrey;}#seajs-debug-console #seajs-debug-header {    margin: 0;    padding: 5px 5px 5px 10px;    height: 20px;    line-height: 20px;    font-weight: bold;    font-size: 16px;    background: #564F8A;    color: #cdbfe3;}#seajs-debug-console #seajs-debug-editor,#seajs-debug-console #seajs-debug-map,#seajs-debug-console #seajs-debug-health {    min-height: 100px;    _height: 100px;    background: #FFF;}#seajs-debug-console #seajs-debug-editor,#seajs-debug-console #seajs-debug-map p input {    font-family: Courier, monospace;    color: #666;}#seajs-debug-console #seajs-debug-editor {    display: block;    width: 510px;    padding: 5px;    resize: vertical;}#seajs-debug-console #seajs-debug-map {    padding: 5px 0;}#seajs-debug-console #seajs-debug-map p {    height: 30px;    line-height: 30px;    overflow: hidden;    padding-left: 10px;}#seajs-debug-console #seajs-debug-map p input {    padding-left: 6px;    height: 24px;    line-height: 24px;    border: 1px solid #dcdcdc;    width: 200px;    vertical-align: middle;    *vertical-align: bottom;}#seajs-debug-console #seajs-debug-map .seajs-debug-hit input {    border-color: #cdbfe3;    background-color: #F6F0FF;}#seajs-debug-console #seajs-debug-map button {    color: #999;}#seajs-debug-console #seajs-debug-map button,#seajs-debug-console #seajs-debug-meta button {    width: 30px;    height: 30px;    line-height: 30px;    text-align: center;}#seajs-debug-console #seajs-debug-status {    height: 35px;}#seajs-debug-console #seajs-debug-status span {    display: inline-block;    *display: inline;    *zoom: 1;    height: 35px;    line-height: 35px;    padding-left: 8px;    color: #AAA;    vertical-align: middle;}#seajs-debug-console #seajs-debug-status button {    width: 35px;    height: 35px;    line-height: 35px;    color: #999;    border: none;    font-size: 16px;    vertical-align: middle;    _vertical-align: top;}#seajs-debug-console #seajs-debug-status button:hover,#seajs-debug-console #seajs-debug-status button.seajs-debug-status-on:hover {    background-color: #f0f0f0;    color: #000;}#seajs-debug-console #seajs-debug-status button:active,#seajs-debug-console #seajs-debug-status button.seajs-debug-status-on {    color: #563d7c;    text-shadow: 0 0 6px #cdbfe3;    background-color: #f0f0f0;}#seajs-debug-console #seajs-debug-action {    float: right;    margin-top: -31px;    *margin-top: -32px;    margin-right: 2px;}#seajs-debug-console #seajs-debug-action button {    position: relative;    z-index: 2;    width: 60px;    height: 28px;    border-radius: 2px;    text-align: center;    color: #333;    background-color: #fff;    border: 1px solid #ccc;    text-transform: uppercase;    *margin-left: 4px;}#seajs-debug-console #seajs-debug-action button:hover,#seajs-debug-console #seajs-debug-action button:focus,#seajs-debug-console #seajs-debug-action button:hover,#seajs-debug-console #seajs-debug-action button:active {  background-color: #ebebeb;  border-color: #adadad;}#seajs-debug-console #seajs-debug-action button:active {    position: relative;    top: 1px;    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);    -moz-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);}#seajs-debug-console #seajs-debug-meta {    position: absolute;    right: 0;    top: 0;}#seajs-debug-console #seajs-debug-meta button {    background: #3f386d;    color: white;}#seajs-debug-console #seajs-debug-health {    height: 500px;    /* loading */}/*-webkit-animation: spin 2s infinite linear;-moz-animation: spin 2s infinite linear;-o-animation: spin 2s infinite linear;-ms-animation: spin 2s infinite linear;animation: spin 2s infinite linear;*/#seajs-debug-console.seajs-debug-mini {    width: 30px;    height: 30px;    border: none;}/* ie6 */#seajs-debug-console {    _position: absolute;    _top: expression(documentElement.scrollTop+documentElement.clientHeight-this.clientHeight-5);}* html {    _background: url(null) no-repeat fixed;}");
// Localstorage object
// Simple Store: https://github.com/marcuswestin/store.js/blob/master/store.js

  var doc = document,
    win = window,
    loc = location

  var store = {};

  var localStorageName = 'localStorage',
    namespace = '__storejs__',
    storage

  store.disabled = false
  store.set = function(key, value) {
  }
  store.get = function(key) {
  }

  // Different from store.js
  function isString(val) {
    return {}.toString.call(val) == "[object String]"
  }

  store.serialize = function(value) {
    if (isString(value)) return value

    // isObject
    var html = []
    for (var key in value) {
      var val = value[key]
      if (isString(val)) {
        val = val.replace(/'/g, '"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        val = "'" + val + "'"
      }
      // isArray
      else if (val.hasOwnProperty("length")) {
        var tmp = []
        for (var i = 0; i < val.length; i++) {
          var f = trim(val[i][0])
          var t = trim(val[i][1])

          f.length && t.length && tmp.push('["' + f + '","' + t + '"]')
        }
        val = '[' + tmp.join(',') + ']'
      }
      html.push('' + key + ':' + val)
    }
    return "{" + html.join(",") + "}"
  }
  store.deserialize = function(value) {
    if (!isString(value)) return undefined
    try {
      return (new Function("return " + value))()
    }
    catch (e) {
      return undefined
    }
  }
  // end

  function isLocalStorageNameSupported() {
    try {
      return (localStorageName in win && win[localStorageName])
    }
    catch (err) {
      return false
    }
  }

  if (isLocalStorageNameSupported()) {
    storage = win[localStorageName]
    store.set = function(key, val) {
      if (val === undefined) {
        return store.remove(key)
      }
      storage.setItem(key, store.serialize(val))
      return val
    }
    store.get = function(key) {
      return store.deserialize(storage.getItem(key))
    }
  } else if (doc.documentElement.addBehavior) {
    var storageOwner,
      storageContainer
    try {
      storageContainer = new ActiveXObject('htmlfile')
      storageContainer.open()
      storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
      storageContainer.close()
      storageOwner = storageContainer.w.frames[0].document
      storage = storageOwner.createElement('div')
    } catch (e) {
      storage = doc.createElement('div')
      storageOwner = doc.body
    }
    function withIEStorage(storeFunction) {
      return function() {
        var args = Array.prototype.slice.call(arguments, 0)
        args.unshift(storage)
        storageOwner.appendChild(storage)
        storage.addBehavior('#default#userData')
        storage.load(localStorageName)
        var result = storeFunction.apply(store, args)
        storageOwner.removeChild(storage)
        return result
      }
    }

    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")

    function ieKeyFix(key) {
      return key.replace(forbiddenCharsRegex, '___')
    }

    store.set = withIEStorage(function(storage, key, val) {
      key = ieKeyFix(key)
      if (val === undefined) {
        return store.remove(key)
      }
      storage.setAttribute(key, store.serialize(val))
      storage.save(localStorageName)
      return val
    })
    store.get = withIEStorage(function(storage, key) {
      key = ieKeyFix(key)
      return store.deserialize(storage.getAttribute(key))
    })
  }

  try {
    store.set(namespace, namespace)
    if (store.get(namespace) != namespace) {
      store.disabled = true
    }
    store.remove(namespace)
  } catch (e) {
    store.disabled = true
  }

  // Helpers

  function trim(str) {
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000'
    for (var i = 0, len = str.length; i < len; i++) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(i)
        break
      }
    }
    for (i = str.length - 1; i >= 0; i--) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(0, i + 1);
        break
      }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
  }

  // Main config
  var config = {
    // Force debug when execute debug plugin
    debug: true,
    // Console panel status: true = show, false = hide
    show: true,
    // Load -debug file
    source: false,
    // Disable cache
    nocache: false,
    // Untie combo url
    combo: false,
    // Show seajs.log message: true = show, false = hide
    log: false,
    // Show seajs.health message: true = show, false = hide
    health: false,
    // Mode: mapping(false), editor(true)
    mode: false,
    // Custom config, highest priority
    custom: "",
    // mapping items
    mapping: []
  }


  // Load local config and merge
  var _config = store.get("seajs-debug-config")

  for (var key in _config) {
    config[key] = _config[key]
  }

// Debug Panel Object

  var global = window

  var MAX_TRY = 100
  var pollCount = 0

  var PREFIX = 'seajs-debug-'
  var STATUS_BUTTON_ON_CLS = PREFIX + 'status-on'
  var MIN_CLS = PREFIX + 'mini'
  var HIT_CLS = PREFIX + 'hit'

  function DebugPanel() {
    this.element = null

    this._rendered = false

    this.children = ['header', 'meta']
  }

  DebugPanel.prototype.render = function(children, cbk) {
    var that = this

    if (this._rendered) {
      cbk && cbk()
      return
    }
    this._rendered = true

    // Add all children
    for (var i = 0; i < children.length; i++) {
      if (indexOf(this.children, children[i]) === -1) {
        this.children.push(children[i])
      }
    }

    this.element = doc.createElement("div")
    this.element.id = PREFIX + "console"
    // Hide first
    this.element.style.display = "none"

    var tmpHTML = ''
    for (var i = 0; i < this.children.length; i++) {
      var item = this.children[i]
      var fn = this['_render' + item.charAt(0).toUpperCase() + item.substring(1)]

      fn && (tmpHTML += fn.call(that))
    }
    this.element.innerHTML = tmpHTML

    appendToBody(this.element, function() {
      for (var i = 0; i < that.children.length; i++) {
        var item = that.children[i]

        that[item + 'Element'] = doc.getElementById(PREFIX + item)

        var fn = that['_bind' + item.charAt(0).toUpperCase() + item.substring(1)]

        fn && fn.call(that)
      }

      // Max or Min debug panel
      that.element.style.display = 'block'

      that[config.show ? 'show' : 'hide']()

      cbk && cbk()
    })
  }

  // Header
  DebugPanel.prototype._renderHeader = function() {
    return '<h3 id="' + PREFIX + 'header" style="display: none;">Sea.js Debug Console</h3>'
  }

  // Mapping area
  DebugPanel.prototype._renderMap = function() {
    var tmpHTML = ''

    config.mapping.push(["", "", true])
    for (var i = 0; i < config.mapping.length; i++) {
      var item = config.mapping[i]
      tmpHTML += '<p>'
        + '<input type="text" placeholder="Input source URI" title="Source URI" value="' + item[0] + '" />'
        + '<button style="cursor: default;">&#xe80c;</button>'
        + '<input type="text" placeholder="Input target URI" title="Target URI" value="' + item[1] + '" />'
        + '<button data-name="add" ' + (item[2] ? '' : 'style="display: none;"') + '>&#xe804;</button>'
        + '<button data-name="red" ' + (item[2] ? 'style="display: none;"' : '') + '>&#xe805;</button>'
        + '</p>'
    }

    return '<div id="' + PREFIX + 'map" style="display: none;">'
      + tmpHTML
      + '</div>'
  }

  // Editor
  DebugPanel.prototype._renderEditor = function() {
    return '<textarea id="' + PREFIX + 'editor" style="display: none;">' + config.custom + '</textarea>'
  }

  // Status button bar
  DebugPanel.prototype._renderStatus = function() {

    this.statusInfo = [
      // [config 字段名, 开启时(true)的 title, 关闭时(false)的 title, icon, click fn callback]
      ["source", "Switch to min files", "Switch to source files", "&#xe80b;"],
      ["combo", "Enable combo", "Disable combo", "&#xe801;"],
      ["nocache", "Enable cache", "Disable cache", "&#xe806;"],
      ["log", "Hide seajs log", "Show seajs log", "&#xe809;"],
      ["mode", "Switch mapping mode", "Switch editor mode", "&#xe808;", function(status) {
        this.show()
      }]/*,
      ["health", "Go back", "Show CMD modules' relations", "&#xe807;", function(status) {
        this.show()
        if (status) {
          require.async(seajs.data.base + 'seajs/seajs-health/0.1.0/seajs-health.js')
        }
      }]*/
    ]

    var tmpHTML = ''

    for (var i = 0; i < this.statusInfo.length; i++) {
      var item = this.statusInfo[i]

      var status = item[0]

      tmpHTML += "<button "
        + (config[status] ? 'class="' + STATUS_BUTTON_ON_CLS + '"' : '')
        + ' title="'
        + item[ config[status] ? 1 : 2]
        + '">'
        + item[3]
        + "</button>"
    }
    return '<div id="' + PREFIX + 'status" style="display: none;">'
      + tmpHTML
      + '<span></span>'
      + '</div>'
  }

  // Main button bar
  DebugPanel.prototype._renderAction = function() {

    this.actionInfo = [
      // [Button Text, click callback fn, remove ?seajs-debug or not]
      ["Save", function() {
        var mappingString = []
        var allInput = this.mapElement.getElementsByTagName('input')

        for (var i = 0; i < allInput.length;) {
          var from = trim(allInput[i].value)
          var to = trim(allInput[i + 1].value)

          if (from.length && to.length) {
            if (!validateURL(from)) {
              allInput[i].focus()
              allInput[i].select()
              alert("Invalid URL: " + from)

              return false
            }
            if (!validateURL(to)) {
              allInput[i + 1].focus()
              allInput[i + 1].select()
              alert("Invalid URL: " + to)

              return false
            }
            mappingString.push([from, to])
          }
          i += 2
        }
        config.mapping = mappingString

        try {
          (new Function("return " + this.editorElement.value + ";"))()

          config.custom = trim(this.editorElement.value)

          return true
        } catch (e) {
          alert("invalid config")
          this.editorElement.focus()

          return false
        }
      }, false],
      ["Exit", function() {
        config.debug = false

        return true
      }, true]
    ]

    var tmpHTML = ''

    for (var i = 0; i < this.actionInfo.length; i++) {
      var item = this.actionInfo[i]
      tmpHTML += "<button>" + item[0] + "</button> "
    }
    return'<div id="' + PREFIX + 'action" style="display: none;">'
      + tmpHTML
      + '</div>'
  }

  // Meta button bar
  DebugPanel.prototype._renderMeta = function() {
    this.metaInfo = [
      // [show or hide, icon, title, click callback fn]
      [config.show, "&#xe80a;", "Go to help", function() {
        global.open('https://github.com/seajs/seajs-debug/issues/4', '_blank');
      }],
      [config.show, "&#xe802;", "Minimize console", function() {
        this.hide()
      }],
      [!config.show, "&#xe803;", "Maximize console", function() {
        this.show()
      }]
    ]

    var tmpHTML = ''

    for (var i = 0; i < this.metaInfo.length; i++) {
      var item = this.metaInfo[i]

      tmpHTML += '<button title="'
        + item[2] + '">' + item[1] + '</button>'
    }
    return '<div id="' + PREFIX + 'meta">'
      + tmpHTML
      + '</div>'
  }

  // Health DIV
  DebugPanel.prototype._renderHealth = function() {
    return '<div id="' + PREFIX + 'health" style="display: none;">'
      + '</div>'
  }

  // Bind mapping area
  DebugPanel.prototype._bindMap = function() {
    // Mapping area
    addEvent(this.mapElement, 'click', function(e) {
      var target = e.target || e.srcElement

      if (target.tagName.toLowerCase() === "button") {
        var p = target.parentNode
        var parent = p.parentNode

        if (target.getAttribute("data-name") === "add") {
          var newElem = doc.createElement("p")

          newElem.innerHTML = p.innerHTML
          parent.appendChild(newElem)
          newElem.getElementsByTagName("input")[0].focus()

          target.style.display = "none"
          target.nextSibling.style.display = "inline-block"
        } else if (target.getAttribute("data-name") === "red") {
          parent.removeChild(p)
        }
      }
    })
  }

  // Bind status button bar
  DebugPanel.prototype._bindStatus = function() {
    this.statusTipElement = this.statusElement.getElementsByTagName("span")[0]

    var that = this
    var buttons = this.statusElement.getElementsByTagName("button")

    for (var i = 0; i < buttons.length; i++) {
      (function(button, i) {
        addEvent(button, 'click', function() {
          var item = that.statusInfo[i]
          var newVal = !config[item[0]]

          config[item[0]] = newVal
          that.save()

          button.setAttribute("title", item[ newVal ? 1 : 2])
          that.statusTipElement.innerHTML = item[ newVal ? 1 : 2]
          button.className = newVal ? STATUS_BUTTON_ON_CLS : ""

          item[4] && item[4].call(that, newVal)
        })

        addEvent(button, 'mouseover', function() {
          var item = that.statusInfo[i]

          that.statusTipElement.innerHTML = item[ config[item[0]] ? 1 : 2]
        })

        addEvent(button, 'mouseout', function() {
          that.statusTipElement.innerHTML = ''
        })
      })(buttons[i], i);
    }
  }

  // Main action bar
  DebugPanel.prototype._bindAction = function() {
    var that = this
    var buttons = this.actionElement.getElementsByTagName("button")

    for (var i = 0; i < buttons.length; i++) {
      (function(button, i) {
        addEvent(button, 'click', function() {
          var item = that.actionInfo[i]

          if (item[1].call(that)) {
            that.save()
            item[2] ? loc.replace(loc.href.replace("seajs-debug", "")) : loc.reload()
          }
        })
      })(buttons[i], i);
    }

  }

  // Meta meta bar
  DebugPanel.prototype._bindMeta = function() {
    var that = this
    var buttons = this.metaElement.getElementsByTagName("button")

    for (var i = 0; i < buttons.length; i++) {
      (function(button, i) {
        addEvent(button, 'click', function() {
          var item = that.metaInfo[i]

          item[3] && item[3].call(that)
          that.save()
        })
      })(buttons[i], i);
    }
  }

  // Bind health
  DebugPanel.prototype._bindHealth = function() {
  }

  // Max
  DebugPanel.prototype.show = function() {
    this.element.className = ''
    config.show = true

    for (var i = 0; i < this.children.length; i++) {
      var item = this.children[i]
      indexOf(['meta', 'health', 'editor', 'map'], item) === -1 && this[item + 'Element'] && (this[item + 'Element'].style.display = "block")
    }

    if (config.health) {
      this.switchTo('health')
    } else if (config.mode) {
      this.switchTo('editor')
      this.editorElement.focus();
    } else {
      this.switchTo('map')
    }

    var buttons = this.metaElement.getElementsByTagName("button")
    buttons[0].style.display = "inline-block"
    buttons[1].style.display = "inline-block"
    buttons[2].style.display = "none"
  }

  // Min
  DebugPanel.prototype.hide = function() {
    this.element.className = MIN_CLS
    config.show = false

    for (var i = 0; i < this.children.length; i++) {
      var item = this.children[i]
      item !== 'meta' && this[item + 'Element'] && (this[item + 'Element'].style.display = "none")
    }

    var buttons = this.metaElement.getElementsByTagName("button")
    buttons[0].style.display = "none"
    buttons[1].style.display = "none"
    buttons[2].style.display = "inline-block"
  }

  // Switch panels
  DebugPanel.prototype.switchTo = function(toPanel) {
    var allPanels = ['health', 'editor', 'map']
    for (var i = 0; i < 3; i++) {
      var item = allPanels[i]

      this[item + 'Element'] && (this[item + 'Element'].style.display = toPanel === item ? "block" : "none")
    }
  }

  // Save config
  DebugPanel.prototype.save = function() {
    store.set("seajs-debug-config", config)
  }

  // Set useful input in mappings
  DebugPanel.prototype.setHitInput = function(i, hit) {
    if (!this.mapElement) return

    var item = this.mapElement.getElementsByTagName('p')[i]
    item && hit && (item.className = HIT_CLS)
  }

  DebugPanel.prototype.destory = function(child) {
    var fn = this['_destory' + child.charAt(0).toUpperCase() + child.substring(1)]

    fn && fn.call(this)
  }

  var debugPanel = new DebugPanel()

  debugPanel.config = config

  // Helpers
  function validateURL(textval) {
    var urlregex = new RegExp(
      "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(textval);
  }

  function addEvent(el, type, fn, capture) {
    if (!el) return;
    if (el.addEventListener) {
      el.addEventListener(type, fn, !!capture);
    } else if (el.attachEvent) {
      el.attachEvent('on' + type, fn);
    }
  }

  function removeEvent(el, type, fn, capture) {
    if (!el) return;
    if (el.removeEventListener) {
      el.removeEventListener(type, fn, !!capture);
    } else if (el.detachEvent) {
      el.detachEvent('on' + type, fn);
    }
  }

  function trim(str) {
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000'
    for (var i = 0, len = str.length; i < len; i++) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(i)
        break
      }
    }
    for (i = str.length - 1; i >= 0; i--) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(0, i + 1);
        break
      }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
  }

  function appendToBody(div, callback) {
    pollCount++

    if (doc.body) {
      doc.body.appendChild(div)
      callback && callback()
    }
    else if (pollCount < MAX_TRY) {
      setTimeout(function() {
        appendToBody(div, callback)
      }, 200)
    }
  }

  function indexOf(array, item) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    var nativeIndexOf = Array.prototype.indexOf
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  }

/**
 * The Sea.js plugin for debugging freely
 */

  // if querystring has seajs-debug, force debug: true
  if (loc.search.indexOf("seajs-debug") > -1) {
    config.debug = true
  }

  // Setting seajs.config according config
  seajs.config({
    debug: config.debug
  })

  if (config.debug) {
    // Show console window
    debugPanel.render(['map', 'editor', 'health', 'status', 'action'])

    doc.title = "[Sea.js Debug Mode] - " + doc.title

    seajs.config({
      map: [
        function(uri) {
          // Load map
          var oldUri = uri

          for (var i = 0; i < config.mapping.length; i++) {
            if (!config.mapping[i][0].length || !config.mapping[i][1]) continue

            uri = uri.replace(config.mapping[i][0], config.mapping[i][1])

            debugPanel.setHitInput(i, uri !== oldUri)
          }

          // Add debug file mapping
          if (config.source && !/\-debug\.(js|css)+/g.test(uri)) {
            uri = uri.replace(/\/(.*)\.(js|css)/g, "/$1-debug.$2")
          }
          return uri
        }
      ]
    })

    // Add timestamp to load file from server, not from browser cache
    // See: https://github.com/seajs/seajs/issues/264#issuecomment-20719662
    if (config.nocache) {
      var TIME_STAMP = new Date().getTime()

      seajs.on('fetch', function(data) {
        if (data.uri) {
          // use data.requestUri not data.uri to avoid combo & timestamp conflict
          // avoid too long url
          var uri = data.requestUri || data.uri
          data.requestUri = (uri + (uri.indexOf('?') === -1 ? '?t=' : '&t=') + TIME_STAMP).slice(0, 2000)
        }
      })

      seajs.on('define', function(data) {
        if (data.uri) {
          // remove like ?t=12312 or ?
          data.uri = data.uri.replace(/[\?&]t*=*\d*$/g, '')
        }
      })
    }

    // Excludes all url temporarily
    config.combo && seajs.config({
      comboExcludes: /.*/
    })

    // Load log plugin
    config.log && seajs.config({
      preload: 'seajs-log'
    })

    // Load health plugin
    config.health && seajs.config({
      preload: 'seajs-health'
    })

    // Execute custom config
    if (config.custom) {
      var _config = {}
      try {
        _config = (new Function("return " + config.custom))()
      } catch (e) {
      }
      seajs.config(_config)
    }
  }

  // Add find method to seajs in debug mode
  if (!seajs.find) {
    var cachedModules = seajs.cache

    seajs.find = function(selector) {
      var matches = []

      for (var uri in cachedModules) {
        if (cachedModules.hasOwnProperty(uri)) {
          if (typeof selector === "string" && uri.indexOf(selector) > -1 ||
            selector instanceof RegExp && selector.test(uri)) {
            var mod = cachedModules[uri]

            mod.exports && matches.push(mod.exports)
          }
        }
      }

      return matches
    }
  }


define("seajs/seajs-debug/1.1.1/seajs-debug-debug", [], {});
})();