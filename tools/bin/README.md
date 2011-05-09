
Install on Mac OS X
--------------------

 - brew install node
 - sudo vi /etc/paths, and add /path/to/seajs/tools/bin


Install on Windows
-------------------

 - add X:\\path\\to\\seajs\\tools\\bin to your %PATH%


Usage
------

    sbuild --help
    sbuild a.js [--combo [all]]
    sbuild a.js b.js [--combo [all]]
    sbuild *.js [--combo [all]]
    sbuild some_directory [--combo [all]] [-r]
    sbuild clear

    snode filename.js [--base path/to/seajs/build]
