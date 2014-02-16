(function() {
    if (window.lazyreaderIsLoaded) return;
    window.lazyreaderIsLoaded = true;
    var $;

    var me = {
        wpm: +localStorage["lazyReader.wpm"] || 300,
        overlayHTML: '' +
            '<div class="lazyReader-overlay">' +
            '   <div class="lazyReader-text">' +
                '<span class="lazyReader-inactiveBefore"></span>' +
                ' <span class="lazyReader-activeBefore"></span>' +
                '<span class="lazyReader-activeCenter"></span>' +
                '<span class="lazyReader-activeAfter"></span> ' +
                '<span class="lazyReader-inactiveAfter"></span>' +
            '   </div>' +
            '   <div class="lazyReader-progressWrap">' +
            '      <div class="lazyReader-progress"></div>' +
            '   </div>' +
            '   <div class="lazyReader-instructions">' +
            '       <span class="lazyReader-key">space</span> to play/pause<br />' +
            '       <span class="lazyReader-key">&uarr;&darr;</span> to change words per minute<br />' +
            '       <span class="lazyReader-key">&larr;&rarr;</span> to navigate through the text<br />' +
            '       <span class="lazyReader-key">esc</span> to close this crap <br />' +
            '       <span class="lazyReader-key">WPM</span> <span class="lazyReader-wpm"> </span>' +
            '   </div>' +
            '   <span class="lazyReader-footer">' +
            '       by David Buezas &amp; Emiliano Onorati' +
            '   </span>' +
            '</div>',
        overlayCSS: '' +
            '.lazyReader-overlay{' +
            '   position: fixed;' +
            '   top: 0;' +
            '   bottom: 0;' +
            '   left: 0;' +
            '   right: 0;' +
            '   background: #272822;' +
            '   opacity: 0.9;' +
            '   z-index: 99999999;' +
            '}' +
            '.lazyReader-overlay > *{' +
            '   font-family: monospace !important;' +
            '}' +
            '.lazyReader-progressWrap{' +
            '   position: absolute;' +
            '   bottom: 30px;' +
            '   left: 0;' +
            '   right: 0;' +
            '   margin: 1% 5%;' +
            '   height: 5%;' +
            '   background: lightgray;' +
            '   border-radius: 100px;' +
            '   overflow: hidden;' +
            '}' +
            '.lazyReader-progress{' +
            '   position: absolute;' +
            '   left: 0;' +
            '   height: 100%;' +
            '   background: gray;' +
            '}' +
            '.lazyReader-instructions{' +
            '   position: absolute;' +
            '   top: 0;' +
            '   background: #ccc;' +
            '   border-radius: 2px;' +
            '   margin: 5px;' +
            '   padding: 5px;' +
            '   box-shadow: 1px 1px 1px 0 #222;' +
            '}' +
            '.lazyReader-key{' +
            '   font-family: courier !important;' +
            '   font-size: 11px; !important' +
            '   background: #aaa;' +
            '   padding: 0 2px;' +
            '   border-radius: 2px;' +
            '   margin: 2px;' +
            '   box-shadow: 1px 1px 1px 0 #222;' +
            '}' +
            '.lazyReader-text{' +
            '   white-space:nowrap;' +
            '   color: #75715E;' +
            '   position: absolute;' +
            '   bottom: 50%;' +
            '   font-size: 50px !important;' +
            '}' +
            '.lazyReader-activeCenter{' +
            '   color: #F92772;' +
            '}' +
            '.lazyReader-activeBefore,' +
            '.lazyReader-activeAfter{' +
            '   color: #F8F8F2;' +
            '}'+
            '.lazyReader-footer{'+
            '   position: absolute;' +
            '   top: 5px;' +
            '   right: 10px;' +
            '   margin-left: -102px;' +
            '   box-shadow: 1px 1px 1px 0 #111;' +
            '   background: #333;' +
            '   border-radius: 20px;' +
            '   padding: 8px 20px;' +
            '   font-weight: 700;' +
            '   color: #fff;' +
            '}',
        keyboardHandler: function(e) {
            var pressed = e.keyCode;
            var esc = 27;
            var space = 32;
            var left = 37;
            var up = 38;
            var right = 39;
            var down = 40;
            if (pressed === esc) {
                me.close();
            } else if (pressed === space) {
                me.togglePlay();
            } else if (pressed === left || pressed === right) {
                me.togglePlay(false);
                me.move(pressed === left ? -1 : 1);
                me.draw();
            } else if (pressed == up || pressed == down) { /* up and down */
                me.wpm *= (pressed == up) ? 1.1 : 1 / 1.1;
                localStorage["lazyReader.wpm"] = me.wpm;
                me.draw();
            } else {
                return;
            }
            return false; /* prevent bubbling*/
        },
        showOverlay: function(selection) {
            me.words = selection.replace(/^\s+|\s+$/g, ''); /*trim*/
            me.words = me.words.split(/\s+/); /*split by separators*/

            me.$ = $(me.overlayHTML).appendTo("body");
            $(document).on("keydown.lazyReader", me.keyboardHandler);
            me.$wpm = me.$.find(".lazyReader-wpm");
            me.$text = me.$.find(".lazyReader-text");
            me.$inactiveBefore = me.$.find(".lazyReader-inactiveBefore");
            me.$activeBefore = me.$.find(".lazyReader-activeBefore");
            me.$activeCenter = me.$.find(".lazyReader-activeCenter");
            me.$activeAfter = me.$.find(".lazyReader-activeAfter");
            me.$inactiveAfter = me.$.find(".lazyReader-inactiveAfter");
            me.$progress = me.$.find(".lazyReader-progress");
            me.index = -1;
            me.togglePlay(true);
        },
        isPlaying: function() {
            return me.timeoutId !== undefined;
        },
        togglePlay: function(play) {
            if (play === undefined) {
                play = !me.isPlaying();
            } else if (play === me.isPlaying()) {
                return;
            }

            if (play) {
                me.cycle();
            } else {
                clearTimeout(me.timeoutId);
                me.timeoutId = undefined;
            }
            me.draw();
        },
        cycle: function() {
            me.move(1);
            if (me.index === me.words.length-1){
                me.close();
                return;
            }
            me.draw();
            var wordEndsWith = me.words[me.index].substr(-1);
            var factor = {
                ".": 3,
                ";": 2,
                ":": 2
            }[wordEndsWith] || 0;
            var waitTime = 60 / me.wpm * 1000;
            if (factor > 0){
                /* we must clear the text and wait a little bit since a sentence separator appeared */
                me.timeoutId = setTimeout(function() {
                    me.clearText();
                    me.timeoutId = setTimeout(function(){
                        me.cycle();
                    }, waitTime * factor);
                }, waitTime );
            } else {
                me.timeoutId = setTimeout(function(){
                    me.cycle();
                }, waitTime);
            }
        },
        move: function(words) {
            me.index += words;
            me.index = Math.min(Math.max(0, me.index), me.words.length - 1);
        },
        close: function() {
            me.togglePlay(false);
            me.$.remove();
            me.$ = undefined;
            $(document).off(".lazyReader");
        },
        clearText: function() {
            me.$inactiveBefore.text("");
            me.$activeBefore.text("");
            me.$activeCenter.text("");
            me.$activeAfter.text("");
            me.$inactiveAfter.text("");
        },
        draw: function() {
            me.$inactiveBefore.text(
                me.isPlaying() ? "" : me.words.slice(0, me.index).join(" ")
            );
        
            var word = me.words[me.index];
            var mid = Math.floor((word.length - 1) / 2);
            me.$activeBefore.text(word.substr(0, mid));
            me.$activeCenter.text(word[mid]);
            me.$activeAfter.text(word.substr(mid + 1));

            me.$inactiveAfter.text(
                me.isPlaying() ? "" : me.words.slice(me.index + 1).join(" ")
            );

            me.$wpm.text(Math.floor(me.wpm));
            me.$text.css({
                marginLeft: 0
            });
            var leftOffset = -me.$activeCenter.offset().left;
            me.$text.css({
                marginLeft: me.$.width() / 2 + leftOffset
            });
            me.$progress.css({
                width: (me.index/(me.words.length-1))*100+"%"
            });
        }
    };

    function loadJQuery(callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js";
        script.onreadystatechange = callback;
        script.onload = function() {
            jQuery.noConflict();
            callback(jQuery);
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function loadCSS(cssText) {
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = cssText;
        } else {
            style.appendChild(document.createTextNode(cssText));
        }
        var head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(style);
    }
    loadCSS(me.overlayCSS);
    loadJQuery(function(jQuery) {
        $ = jQuery;
        $(document).on("keydown",function(e){
            if (me.$ === undefined){
                /* overlay is not visible*/
                var pressed = e.keyCode;
                var space = 32;
                if (pressed === space) {
                    me.showOverlay(window.getSelection().toString());
                    me.togglePlay(true);
                    return false;
                }
            }
        });
        console.log("LazyReader loaded. Select some text and press the space bar to begin.");
    });
})();