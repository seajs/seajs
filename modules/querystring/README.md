## Query String

This module provides utilities for dealing with query strings.
It provides the following methods:


### querystring.stringify(obj, sep='&', eq='=', arrayKey=false)

Serialize an object to a query string.
Optionally override the default separator and assignment characters.

Example:

    querystring.stringify({foo: 'bar'})
    // returns
    'foo=bar'

    querystring.stringify({foo: 'bar', baz: 'john', baz: 'bob'}, ';', ':')
    // returns
    'foo:bar;baz:john;baz:john'

    querystring.stringify({bar: 'john', bar: 'bob'}, null, null, true)
    // returns
    'bar%5B%5D=john&bar%5B%5D=bob'


### querystring.parse(str, sep='&', eq='=')

Deserialize a query string to an object.
Optionally override the default separator and assignment characters.

Example:

    querystring.parse('a=b&b=c')
    // returns
    { a: 'b', b: 'c' }


### querystring.escape

The escape function used by `querystring.stringify`,
provided so that it could be overridden if necessary.


### querystring.unescape

The unescape function used by `querystring.parse`,
provided so that it could be overridden if necessary.


### require('querystring')

querystring is a built-in module in SeaJS. You can get it very easily:

    define(function(require, exports, module) {
      var querystring = require('querystring');

      querystring.stringify(someObject);
      querystring.parse(someString);

    });
