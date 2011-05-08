
define(function(require, exports) {

  var stdout = require('./stdout');
  var math = require('./math');

  var operators = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiple',
    '×': 'multiple',
    'x': 'multiple',
    '/': 'divide',
    '%': 'divide'
  };

  var special = {
    'C': 'clear',
    'c': 'clear',
    'esc': 'clear',
    'delete': 'del',
    '=': 'equal',
    'enter': 'equal',
    '±': 'inverse'
  };


  var previousInput = '';
  var currentInput = '';
  var operator;


  exports.handleInput = function(value) {
    // number
    if (isNum(value) || isDot(value)) {
      Action.updateInput(value);
    }
    // operator
    else if (isOperator(value)) {
      Action.operate(value);
    }
    // special actions
    else if (special[value]) {
      Action[special[value]]();
    }
  };


  var Action = {

    updateInput: function(value) {
      if (isDot(value) &&
          currentInput.indexOf('.') !== -1) {
        return;
      }

      currentInput += value;
      stdout.updateResult(currentInput);
    },

    operate: function(type) {
      if (operator) {
        previousInput = calc();
        stdout.updateResult(previousInput);
      }
      else {
        previousInput = currentInput;
      }
      currentInput = '';

      operator = operators[type];
      stdout.updateOperator(type);
    },

    clear: function () {
      previousInput = '';
      currentInput = '0';
      operator = null;
      stdout.clear();
    },

    del: function () {
      if (currentInput && currentInput !== '0') {
        currentInput = currentInput.substring(0, currentInput.length - 1);
        if (!currentInput) {
          currentInput = '0';
        }
        stdout.updateResult(currentInput);
      }
    },

    inverse: function () {
      currentInput = 0 - currentInput;
      stdout.updateResult(currentInput);
    },

    equal: function () {
      this.operate('');
    }
  };


  function calc() {
    return math[operator](Number(previousInput), Number(currentInput));
  }

  function isNum(str) {
    return /[0-9]/.test(str);
  }

  function isDot(str) {
    return str === '.';
  }

  function isOperator(str) {
    return !!operators[str];
  }

});
