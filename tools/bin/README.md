
Install on Mac OS X
--------------------

 # brew install node
 # curl http://npmjs.org/install.sh | sh
 # npm install uglify-js
 # sudo vi /etc/paths, and adds path/to/seajs/tools/bin


Usage
------

   sbuild filename.js [--combo | --aio]

   sbuild a.js  Only extract dependencies and compress it
       --combo  Also combine relative dependencies to a.js
       --aio    Combine all dependencies to a.js [NOT implemented yet]

