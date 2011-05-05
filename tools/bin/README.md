
Install on Mac OS X
--------------------

 - brew install node
 - curl http://npmjs.org/install.sh | sh
 - npm install uglify-js
 - sudo vi /etc/paths, and adds path/to/seajs/tools/bin


Usage
------

    sbuild --help
    sbuild [--combo] a.js
    sbuild [--combo] a.js b.js
    sbuild [--combo] *.js
    sbuild [--combo] [-r] some_directory
    sbuild clear
