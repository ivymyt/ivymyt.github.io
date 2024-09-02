/**
 * Text Countlet v0.6
 * last revision: 2010-04-26
 *
 * Contact Ivy Tsai ( https://github.com/ivymyt ) regarding bugs,
 * suggestions, and improvements.
 *
 * This work is licensed under the
 * Creative Commons Attribution-Noncommercial-Share Alike 2.5 Canada License.
 * To view a copy of this licence, visit
 * http://creativecommons.org/licenses/by-nc-sa/2.5/ca/
 *
 * PLEASE RETAIN THIS MESSAGE WHEN REPRODUCING.
 */

/* These are customizable. */
var aqp_ct_cssUrl = 'http://ivymyt.github.io/countlet/countlet.css';
var aqp_ct_consoleL = 10, aqp_ct_consoleT = 10;
/* End customizable variables. */

var aqp_ct_console, aqp_ct_longInfo, aqp_ct_shortInfo, aqp_ct_status, aqp_ct_closeB;

var aqp_ct_mode = 'word', aqp_ct_paraMode = 1, aqp_ct_smartPunc = true, aqp_ct_noPunc = false, aqp_ct_selected, aqp_ct_mouseX, aqp_ct_mouseY;

function aqp_ct_init() {
	var d = document;
	if (d.getElementById('aqp_ct_console')) { return; }
	
	var cssObj = d.createElement('link');
	cssObj.type = 'text/css';
	cssObj.rel = 'stylesheet';
 	cssObj.href = aqp_ct_cssUrl;
	d.getElementsByTagName('head')[0].appendChild(cssObj);

	aqp_ct_console = d.createElement('div');
	aqp_ct_console.id = 'aqp_ct_console';
	aqp_ct_console.style.left = aqp_ct_consoleL + 'px';
	aqp_ct_console.style.top = aqp_ct_consoleT + 'px';
	d.body.appendChild(aqp_ct_console);
	
	var titleBar = aqp_appendText(aqp_ct_console, '', 'div', ['id', 'aqp_ct_titlebar']);

	aqp_ct_closeB = aqp_appendText(titleBar, '', 'div', ['id', 'aqp_ct_closebn']);
	aqp_appendText(aqp_ct_closeB, String.fromCharCode(215), 'div');
	aqp_ct_closeB.onclick = aqp_ct_close;

	aqp_ct_count();
	aqp_ct_updateStatus();

	aqp_ct_shortInfo = d.createElement('div');
	aqp_ct_shortInfo.id = 'aqp_ct_shortinfo';
	aqp_appendText(aqp_ct_shortInfo, 'Press ');
	aqp_appendText(aqp_ct_shortInfo, 'i', 'b');
	aqp_appendText(aqp_ct_shortInfo, ' for instructions');
	aqp_ct_console.appendChild(aqp_ct_shortInfo);

	var longInfoArr = [ ['c', 'switch to character count'], ['w', 'switch to word count'], ['p', 'switch to paragraph count'], ['1, 2', 'set the number of line breaks between paragraphs'], ['s', 'toggle punctuation mode'], ['i', 'show/hide instructions'], ['[esc]', 'close this window'] ];
	aqp_ct_longInfo = d.createElement('div');
	aqp_ct_longInfo.id = 'aqp_ct_longinfo';
	aqp_ct_longInfo.style.display = 'none';
	var dl = d.createElement('dl');
	for (var i = 0, iLen = longInfoArr.length, dt, dd; i < iLen; i++) {
		dt = d.createElement('dt');
		aqp_appendText(dt, longInfoArr[i][0]);
		dl.appendChild(dt);
		dd = d.createElement('dd');
		aqp_appendText(dd, longInfoArr[i][1]);
		dl.appendChild(dd);
	}
	aqp_ct_longInfo.appendChild(dl);
	aqp_ct_console.appendChild(aqp_ct_longInfo);
	
	// register events
	aqp_addEvent(d, 'mouseup', aqp_ct_mouseUp);
	aqp_addEvent(d, 'keyup', aqp_ct_keyUp);
	aqp_addEvent(aqp_ct_console, 'mousedown', aqp_ct_cMouseDown);
	
	// turn off selection in IE
	if (typeof(aqp_ct_console.onselectstart) != undefined) {
		aqp_ct_console.attachEvent('onselectstart', rfalse);
		aqp_ct_closeB.attachEvent('onselectstart', rfalse);
		aqp_ct_status.attachEvent('onselectstart', rfalse);
		aqp_ct_shortInfo.attachEvent('onselectstart', rfalse);
		aqp_ct_longInfo.attachEvent('onselectstart', rfalse);
	}
}

function aqp_ct_close() {
	aqp_removeEvent(document, 'mouseup', aqp_ct_mouseUp);
	aqp_removeEvent(document, 'keyup', aqp_ct_keyUp);
	
	document.body.removeChild(aqp_ct_console);
}

/* Event handlers */

function aqp_ct_cMouseDown(e) {
	if (document.all) {
		aqp_ct_mouseX = window.event.clientX;
		aqp_ct_mouseX = window.event.clientY;
	} else {
		aqp_ct_mouseX = e.clientX;
		aqp_ct_mouseY = e.pageY;
	}
	
	var left = aqp_ct_console.style.left;
	var top = aqp_ct_console.style.top;
	if ((typeof(left) == 'string') && (left.indexOf('px') > -1)) {
		aqp_ct_consoleL = parseInt(left.substring(0, left.length - 2));
		aqp_ct_consoleT = parseInt(top.substring(0, top.length - 2));
	} else {
		aqp_ct_consoleL = left;
		aqp_ct_consoleL = top;
	}
	
	aqp_addEvent(document, 'mousemove', aqp_ct_cMouseMove);
}

function aqp_ct_cMouseMove(e) {
	var left = aqp_ct_consoleL - aqp_ct_mouseX;
	var top = aqp_ct_consoleT - aqp_ct_mouseY;
	if (document.all) {
		aqp_ct_console.style.left = left + window.event.clientX;
		aqp_ct_console.style.top = top + window.event.clientY;
	} else {
		aqp_ct_console.style.left = (left + e.clientX) + 'px';
		aqp_ct_console.style.top = (top + e.clientY) + 'px';
	}
}

function aqp_ct_mouseUp(e) {
	aqp_removeEvent(document, 'mousemove', aqp_ct_cMouseMove);
	aqp_ct_count();
}

function aqp_ct_keyUp(e) {
	var errMsg = 'Unable to change settings.';
	// Key capture code from howtocreate.co.uk
	if( !e ) {
		if( window.event ) { // IE
			e = window.event;
		} else { // cannot get event
			aqp_ct_addMsg(errMsg);
			return;
		}
	}
	if( typeof( e.keyCode ) == 'number' ) { // DOM
		e = e.keyCode;
	} else if( typeof( e.charCode ) == 'number' ) { // also NS 6+, Mozilla 0.9+
		e = e.charCode;
	} else { // cannot get keycode
		aqp_ct_addMsg(errMsg);
		return;
	}

	switch(e) {
		case 27: aqp_ct_close(); return;
		case 49: aqp_ct_paraMode = 1; break;
		case 50: aqp_ct_paraMode = 2; break;
		case 67: aqp_ct_mode = 'character'; break;
		case 73: // toggle info
			if (aqp_ct_shortInfo.style.display == 'none') {
				aqp_ct_shortInfo.style.display = 'block';
				aqp_ct_longInfo.style.display = 'none';
			} else {
				aqp_ct_shortInfo.style.display = 'none';
				aqp_ct_longInfo.style.display = 'block';
			}
			break;
		case 80: aqp_ct_mode = 'paragraph'; break;
		case 83: // toggle punctuation mode
			if (aqp_ct_mode == 'word') {
				aqp_ct_smartPunc = aqp_ct_smartPunc ? false : true;
			} else if (aqp_ct_mode == 'character') {
				aqp_ct_noPunc = aqp_ct_noPunc ? false : true;
			}
			break;
		case 87: aqp_ct_mode = 'word'; break;
	}
	
	// update count and aqp_ct_status
	aqp_ct_count();
	aqp_ct_updateStatus();
}

/* Counting functions */

function aqp_ct_count() {
	if (window.getSelection) { // Mozilla, Safari and Opera
		var selRange, selObj = window.getSelection();
		if (window.getSelection().toString() == '') {
			aqp_ct_selected = '';
		} else {
			if (selObj.getRangeAt) {
				selRange = selObj.getRangeAt(0);
			} else { // Safari
				selRange = document.createRange();
				selRange.setStart(selObj.anchorNode,selObj.anchorOffset);
				selRange.setEnd(selObj.focusNode,selObj.focusOffset);
			}
			if (selObj.containsNode(aqp_ct_console, true)) {
				selRange.setEndBefore(aqp_ct_console);
			}
			aqp_ct_selected = selRange.toString();
		}
	} else if (document.selection) { // IE
		aqp_ct_selected = document.selection.createRange().text;
	}

	if (aqp_ct_selected == '' || aqp_ct_selected == null || aqp_ct_selected == undefined) {
		aqp_ct_changeMsg('Select text to calculate.');
	} else {
		var ctr = 0;
		switch(aqp_ct_mode) {
			case 'word': ctr = aqp_ct_word(aqp_ct_selected); break;
			case 'paragraph': ctr = aqp_ct_para(aqp_ct_selected); break;
			case 'character': ctr = aqp_ct_char(aqp_ct_selected); break;
		}
		aqp_ct_changeMsg(aqp_ct_pluralize(ctr, aqp_ct_mode) + '.');
	}
}

function aqp_ct_word(text) {
	var wordCtr = 0;
	var isWord = false;

	for (var i = 0, iLen = text.length; i < iLen; i++) {
		if ( isWord && text[i] == '\n' && aqp_ct_isHyphen(text.charCodeAt(i - 1)) ) {
			// hyphenated at end of line - do nothing
		} else if ( isWord && aqp_ct_isWordSplitter(i) ) {
			// new word
			wordCtr++;
			isWord = false;
		} else if ( aqp_ct_smartPunc ) {
			if ( !aqp_ct_isPunc( text.charCodeAt(i) ) ) {
				isWord = true;
			}
			// else do nothing
		} else {
			isWord = true;
		}
	}

	// if last character is part of a word, add one
	if ( isWord ) {
		wordCtr++;
	}
	
	return wordCtr;
}

function aqp_ct_para(text) {
	// set delineator to number of line breaks required
	for (var i = 0, delineator = ''; i < aqp_ct_paraMode; i++) {
		delineator += '\n';
	}

	var paras = text.split(delineator);
	var paraCtr = 0;

	for (var i = 0, iLen = paras.length; i < iLen; i++) {
		if (paras[i] != '') { paraCtr++; }
	}

	return paraCtr;
}

function aqp_ct_char(text) {
	var totalChars = text.length;
	var charCtr = totalChars;

	if (aqp_ct_noPunc) {
		for (var i = 0, charCode; i < totalChars; i++) {
			if (aqp_ct_isPunc(text.charCodeAt(i))) { charCtr--; }
		}
		//TODO: ignore spaces?
	}

	return charCtr;
}

/* Counting helper functions */

function aqp_ct_isHyphen(charCode) {
	if (charCode == 45 || charCode == 8208 || charCode == 8211) { return true; }
	return false;
}

function aqp_ct_isPunc(charCode) {
	// all ASCII punctuation plus any non-alphanumerical characters
	if (charCode < 48) { return true; }
	else if (charCode > 57 && charCode < 65) { return true; }
	else if (charCode > 90 && charCode < 97) { return true; }
	else if (charCode > 123 && charCode < 128) { return true; }
	// Unicode General Punctuation range
	else if (charCode >= 8192 && charCode <= 8303) { return true; }
	// Unicode Supplementary Punctuation range
	else if (charCode >= 57344 && charCode <= 57599) { return true; }
	
	return false;
}

function aqp_ct_isWordSplitter(index) {
	var maxPuncLength = 3; // num chars of longest multi-character punctuation

	var start = index - maxPuncLength + 1;
	if (start < 0) { start = 0; }
	var str = aqp_ct_selected.substring(start, index + 1);
	
	if ( !aqp_ct_smartPunc && (str.length > 1) && ((str.substr(1) == '--') || (str == '...')) ) {
		// multi-character punctuation
		return true;
	} else {
		var curr = aqp_ct_selected.charCodeAt(index);
		
		if ( ((curr >= 9) && (curr <= 13)) || (curr == 32) ) {
			// space, new line, tab
			return true;
		} else if ( !aqp_ct_smartPunc && ((curr == 47) || (curr == 92) || ((curr >= 8210) && (curr <= 8213)) || (curr == 8230)) ) {
			// slash, dash, ellipsis
			return true;
		}
	}

	return false;
}

/* Print functions */

function aqp_ct_updateStatus() {
	var statusText = aqp_ct_mode + ' count mode\n';
	if (aqp_ct_mode == 'paragraph') {
		statusText += aqp_ct_pluralize(aqp_ct_paraMode, 'line break') + ' per paragraph\n';
	} else if (aqp_ct_mode == 'word') {
		if (aqp_ct_smartPunc) { statusText += 'smart '; }
		else { statusText += 'normal '; }
		statusText += 'punctuation mode';
	} else {
		if (aqp_ct_noPunc) { statusText += 'don\'t '; }
		statusText += 'count punctuation';
	}
	
	aqp_replace(aqp_ct_console, 'div', 'aqp_ct_status', statusText);
}

function aqp_ct_addMsg(msg) {
	aqp_appendText(document.getElementById('aqp_ct_msg'), msg);
}

function aqp_ct_changeMsg(msg) {
	aqp_replace(aqp_ct_console, 'div', 'aqp_ct_msg', msg);
}

// VERY basic pluralizer
function aqp_ct_pluralize(num, root, suffix) {
	if (suffix == '' || suffix == null || suffix == undefined) {
		suffix = 's';
	}

	if (num != 1 && num != -1) {
		root += suffix;
	}

	root = num + ' ' + root;

	return root;
}

/* GENERAL LIBRARY */

/**
 * Each additional argument (in the form [attributeName, attributeSetting])
 * is used to specify an attribute for the wrapper tag.
 * 
 * @param tagName: an optional wrapper tag for the text.
 * @return the immediate parent of the newly created text nodes
 */
function aqp_appendText(parent, text, tagName) {
	// if wrapping in a tag
	if (tagName != '' & tagName != null && tagName != undefined) {
		var grandparent = parent;
		// create wrapper tag
		parent = document.createElement(tagName);
		grandparent.appendChild(parent);
		// add attributes
		for (var i = 3; i < arguments.length; i++) {
			parent.setAttribute(arguments[i][0], arguments[i][1]);
		}
	}

	// separate text into lines and append each line
	var lines = text.split('\n');
	for (var i = 0, iLen = lines.length; i < iLen - 1; i++) {
		parent.appendChild(document.createTextNode(lines[i]));
		parent.appendChild(document.createElement('br'));
	}
	parent.appendChild(document.createTextNode(lines[lines.length - 1]));

	return parent;
}

/**
 * @param tagName - wrapper tag for the text
 * @param id - id of the wrapper tag
 */
function aqp_replace(parent, tagName, id, text) {
	var oldElement = document.getElementById(id);
	var newElement = document.createElement(tagName);
	aqp_appendText(newElement, text);
	newElement.setAttribute('id', id);

	if (oldElement == null || oldElement == undefined) {
		// if no prior element with that ID
		aqp_ct_console.appendChild(newElement);
	} else {
		aqp_ct_console.replaceChild(newElement, oldElement);
	}
	
	return newElement;
}

function aqp_addEvent(element, type, func) {
	if (element.addEventListener) { element.addEventListener(type, func, false); }
	else if (element.attachEvent) { element.attachEvent('on' + type, func); }
	else { element['on' + type] = func; }
}

function aqp_removeEvent(element, type, func) {
	if (element.removeEventListener) { element.removeEventListener(type, func, false); }
	else if (element.detachEvent) { element.detachEvent('on' + type, func); }
	else if (element['on' + type] == func) { element['on' + type] = null; }
}

/* */

aqp_ct_init();
