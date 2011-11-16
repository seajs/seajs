<?php
sleep(5);
?>
for (var i = 0; i < 1000; i++) {
  document.getElementById('o').appendChild(document.createTextNode(i));
}
if (window.res) window.res.push('D');
