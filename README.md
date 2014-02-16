lazyreader
==========

Bookmarkable JS script that loads a fast read overlay when the user selects text and press the space bar.

Instead of moving your eyes around when reading, just focus on the red letter and let the script do the rest for you.
You can configure the speed, pause and navigate through the text.

Compatibility:
--------------
Tested on Chrome and Firefox, might (even) run on other browsers!

Installation:
-------------
To add it as a bookmark for easy access just create a bookmark in your browser and in the URL box type:
	
	javascript:

and afterwards paste the content of lazyreader.js.

To just test it, paste the contents of lazyreader.js into the console.

Use:
----
After clicking the bookmark, just select some text and press the space bar. You'll get some extra options on the screen.

Alternatively you can open this link and test it directly:
[this link](https://rawgithub.com/dbuezas/lazyreader/master/demo.html "Just some text with the script embebed")

Demo:
-----
![](http://raw.github.com/dbuezas/lazyreader/master/demo.gif)


I know, it should be a browser extension, the CSS/HTML/JS should be in different files, etc, but I'm too lazy and I just wanted to make it bookmarkable. This is just a Sunday hack.

Known bugs:
-----------
Some sites will override the css and capture keystrokes before the script does.