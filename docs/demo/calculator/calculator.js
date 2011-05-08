
define(function(require, exports) {

  var stdout = require('./stdout');
  var math = require('./math');

  var operators = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiple',
    '×': 'multiple',
    '/': 'divide',
    '%': 'divide'
  };

  var special = {
    'C': clear,
    'c': clear,
    'esc': clear,
    'delete': del,
    '=': equal,
    'enter': equal,
    '±': inverse
  };


  var previousInput = '';
  var currentInput = '';
  var operator;


  exports.handleInput = function(value) {
    // input number
    if (isNum(value)) {
      currentInput += value;
      stdout.updateResult(currentInput);
    }
    else if (isDot(value)) {
      if (currentInput.indexOf('.') === -1) {
        currentInput += value;
        stdout.updateResult(currentInput);
      }
    }
    // input operator
    else if (isOperator(value)) {
      operate(value);
    }
    // input enter/esc/etc.
    else if(special[value]) {
      special[value]();
    }
  };


  function operate(type) {
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
  }

  function calc() {
    return math[operator](Number(previousInput), Number(currentInput));
  }

  function clear() {
    previousInput = '';
    currentInput = '0';
    operator = null;
    stdout.clear();
  }

  function del() {
    if (currentInput && currentInput !== '0') {
      currentInput = currentInput.substring(0, currentInput.length - 1);
      if (!currentInput) {
        currentInput = '0';
      }
      stdout.updateResult(currentInput);
    }
  }

  function inverse() {
    currentInput = 0 - currentInput;
    stdout.updateResult(currentInput);
  }

  function equal() {
    operate('');
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
