
This specification establishes a convention for creating a style of
reusable JavaScript modules and systems that will load and link those
modules.

*   Modules are singletons.
*   Modules have an implicitly isolated lexical scope.
*   Loading may be eager in asynchronous loaders.
*   Execution must be lazy.
*   With some care, modules may have cyclic dependencies.
*   Systems of modules may be isolated but still share the same context.
*   Modules may be used both in browsers and servers.


Guarantees Made by Module Writers
=================================

1.  A module must only read and write variables in its lexical scope.
1.  A module must only assume that its lexical scope contains the free
    variables ``require``, ``module``, ``exports``, and ``define``
    beyond those defined by JavaScript.  *What constitutes JavaScript is
    beyond the scope of this specification and may vary with practical
    limits on a module's portability.*
1.  A module must only depend on specified behavior of the values
    provided to its lexical scope.
1.  All calls to ``require`` must be by name from lexical scope.
1.  All calls to ``require`` must be given a single string literal as
    the argument.
    *This rule exists to help asynchronous loader implementations
    guarantee that all modules are loaded before they're required.
    String literals are discoverable before execution by scanning the
    text. If you need to load a module identified by a variable or
    expression, use ``require.async``.*
1.  Within a ``define`` ``callback``, the variables ``require``,
    ``exports``, and ``module`` must use the corresponding values
    provided as arguments to the callback instead of those received from
    lexical scope.
1.  The first argument, ``require``, to a ``define`` ``callback`` must
    be named ``require``.


Guarantees Made by Module Interpreters
======================================

1.  The top scope of a module must not be shared with any other module.
1.  A ``require`` function must exist in a function's lexical scope.
    1.  The ``require`` function must accept a module identifier as its
        first and only argument.
    1.  ``require`` must return the same value as ``module.exports`` in
        the identified module.
    1.  ``require`` must have an ``async`` function.
        1.  ``async`` must accept an identifier or an array of
            identifiers as its first argument.
            1.  A single identifier is equivalent to an array with a
                single identifier.
        1.  ``async`` accepts an optional ``callback`` function as its
            second argument.
        1.  ``async`` must call ``require`` for each module identifier
            in order
        1.  ``async`` may wait for each module's transitively required
            modules to asynchronously load before calling ``require``.
        1.  If every ``require`` call returns, ``async`` must call
            ``callback`` with the respective exports for each module
            identifier as its arguments.
1.  an ``exports`` object must exist in a function's lexical scope.
    1.  the ``exports`` object must initially be the same value as
        ``module.exports``.
1.  A ``module`` object must exist in a function's lexical scope.
    1.  The ``module`` object must have an ``id`` property.
        1.  The ``module.id`` property must be a module identifier such
            that ``require(module.id)`` must return the
            ``module.exports`` value when called in this or any module
            in the same system of modules.
        1.  The ``module.id`` property may be read-only and
            non-configurable.
    1.  The ``module`` object must have an ``exports`` property.
        1.  The ``module.exports`` property must initially be an empty
            object.
        1.  The ``module.exports`` property must be writable and
            configurable.
1.  a ``define`` function must exist in a function's lexical scope.
    1.  ``define`` accepts a function ("callback") as its last argument.
    1.  ``callback`` accepts ``require``, ``exports``, and ``module``.
    1.  ``callback`` must be called with the corresponding values from
        the module's lexical scope.
    1.  If ``callback`` returns a value other than ``undefined``, the
        return value must be assigned to ``module.exports``.


Module Identifiers
==================

1.  A module identifier is a string of "terms" delimited by forward
    slashes.
1.  A term is either:
    1.  any combination of lower-case letters, numbers, and hyphens,
    1.  ``.``, or
    1.  ``..``
1.  Module identifiers may not have file-name extensions like
    ``.js``.
1.  Module identifiers may be "relative" or "resolved".  A module
    identifier is "relative" if the first term is ``.`` or ``..``.
1.  The ``require`` function in each module resolves relative
    identifiers from the corresponding ``module.id``.


Unspecified
===========

This specification leaves the following important points of
interoperability unspecified:

1.  Whether modules are stored with a database, file system, or factory
    functions, or are interchangeable with link libraries.
1.  Whether a path is supported by the module loader for resolving
    module identifiers.
1.  Whether other arguments may be provided to ``define`` and how they
    are interpreted.


Thanks
=======

This specification is forked from <https://github.com/kriskowal/uncommonjs/blob/master/modules/specification.md>
Thanks Kris Kowal and all members of [CommonJS Group](http://groups.google.com/group/commonjs)!
