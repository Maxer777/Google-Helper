var STRONG_COLOR_REPLACEMENT = "<my style=\"background-color: rgb(244, 208, 63);\">\$&</my>";
var SOFT_COLOR_REPLACEMENT = "<my style=\"background-color: rgb(255, 250, 205);\">\$&</my>";


var encStrongRegExp;
var strongRegExp;
var softRegExp;
var encSoftRegExp;

var enableTool = true;
var enableSoftHighlight = true;

var storage = chrome.storage.local;

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function replaceRecursively(element) {
	//console.log("element.nodeName:" + element.nodeName);
	if (element.nodeName == "MY") { // проверка что элемент уже не обновлен подсветкой
		return true;
	}
	if (encStrongRegExp.test(encodeURIComponent(element.innerText))) {
		//console.log("childElementCount:" + element.childElementCount);
		var childReplaced = false;
		if (element.childElementCount > 0) {
			for (var i = 0; i < element.childNodes.length; ++i) {
				childReplaced = childReplaced || replaceRecursively(element.childNodes[i]);
			}
		}
		if (!childReplaced) {
			var originalText = encodeURIComponent(element.innerText);
			var replacedText = originalText.replace(encStrongRegExp, STRONG_COLOR_REPLACEMENT);
			//console.log("originalText:" + originalText);
			//console.log("replacedText:" + replacedText);
			//console.log("before:" + element.innerHTML);
			element.innerHTML = decodeURIComponent(encodeURIComponent(element.innerHTML).replace(originalText, replacedText));
			//console.log("after:" + element.innerHTML);
			return true;
		}
	} else if (strongRegExp.test(element.innerText)) {
		//console.log("childElementCount:" + element.childElementCount);
		var childReplaced = false;
		if (element.childElementCount > 0) {
			for (var i = 0; i < element.childNodes.length; ++i) {
				childReplaced = childReplaced || replaceRecursively(element.childNodes[i]);
			}
		}
		if (!childReplaced) {
			var originalText = element.innerText;
			var replacedText = originalText.replace(strongRegExp, STRONG_COLOR_REPLACEMENT);
			//console.log("originalText:" + originalText);
			//console.log("replacedText:" + replacedText);
			//console.log("before:" + element.innerHTML);
			element.innerHTML = element.innerHTML.replace(originalText, replacedText);
			//console.log("after:" + element.innerHTML);
			return true;
		}
	} else if (encSoftRegExp.test(encodeURIComponent(element.innerText))) {
		//console.log("childElementCount:" + element.childElementCount);
		var childReplaced = false;
		if (element.childElementCount > 0) {
			for (var i = 0; i < element.childNodes.length; ++i) {
				childReplaced = childReplaced || replaceRecursively(element.childNodes[i]);
			}
		}
		if (!childReplaced) {
			var originalText = encodeURIComponent(element.innerText);
			var replacedText = originalText.replace(encSoftRegExp, SOFT_COLOR_REPLACEMENT);
			console.log("originalText:" + originalText);
			console.log("replacedText:" + replacedText);
			console.log("before:" + element.innerHTML);
			element.innerHTML = decodeURIComponent(encodeURIComponent(element.innerHTML).replace(originalText, replacedText));
			console.log("after:" + element.innerHTML);
			return true;
		}
	} else if (softRegExp.test(element.innerText)) {
		//console.log("childElementCount:" + element.childElementCount);
		var childReplaced = false;
		if (element.childElementCount > 0) {
			for (var i = 0; i < element.childNodes.length; ++i) {
				childReplaced = childReplaced || replaceRecursively(element.childNodes[i]);
			}
		}
		if (!childReplaced) {
			var originalText = element.innerText;
			var replacedText = originalText.replace(softRegExp, SOFT_COLOR_REPLACEMENT);
			//console.log("originalText:" + originalText);
			//console.log("replacedText:" + replacedText);
			//console.log("before:" + element.innerHTML);
			element.innerHTML = element.innerHTML.replace(originalText, replacedText);
			//console.log("after:" + element.innerHTML);
			return true;
		}
	}
	return false;
}

function highlight(words) {
	console.log("FOUND!!! highlight:" + words);
  console.log("TOOL STATE: ",enableTool, enableSoftHighlight);
  if (words) {
			var encodedWords = [words.length];
			var softEncodedWords = [];
			var softWords = [];
			for (var i = 0; i < words.length; ++i) {
				encodedWords[i] = encodeURIComponent(words[i]);
				if (words[i] && words[i].length > 2) {
					softWords.push(words[i]);
					softEncodedWords.push(encodeURIComponent(words[i]));
				}
			}

			
		  encStrongRegExp = new RegExp('\\b' + encodedWords.join('\\b|\\b') + '\\b', "ig");
		  //console.log('encStrongRegExp:' + '\\b' + encodedWords.join('\\b|\\b') + '\\b');
		  strongRegExp = new RegExp('\\b' + words.join('\\b|\\b') + '\\b', "ig");
		  //console.log('strongRegExp:' + '\\b' + words.join('\\b|\\b') + '\\b');
		  softRegExp = new RegExp(softWords.join('|'), "ig");
		  //console.log('softRegExp:' + words.join('|'));
		  encSoftRegExp = new RegExp(softEncodedWords.join('|'), "ig");
		  

		  const kSets = [

					   {selectors: 'p, span, div', color: '#FFFACD'},

					   {selectors: 'li, td, dl, dt', color: '#FFFACD'},

					   {selectors: 'h1, h2, h3, th, td', color: '#FFFACD'}

		  ];

		var t0 = performance.now();
		  for (let set of kSets) {
					   var elements = Array.from(document.querySelectorAll(set.selectors));

					   for (let element of elements) {
						   if (!isEmpty(element.innerText)) {
							   //console.log(element.innerText);
								replaceRecursively(element, encStrongRegExp);
							}
						}
			}
		var t1 = performance.now();
		console.log("Call to highlight took " + (t1 - t0) + " milliseconds.");
	}
}

function loadToolSettings() {
  storage.get('enableTool', function(result){
    enableTool = result;
  });
  storage.get('enableSoftHighlight', function(result){
    enableSoftHighlight = result;
  });
}

window.onload = function() {
	console.log("HIGHLIGHER!!!");

  loadToolSettings();
	var href = window.location.href;
	var canonicalURL = document.querySelector("link[rel='canonical']") ? document.querySelector("link[rel='canonical']").href : undefined;

	console.log("URL:" + href);
	console.log("canonical URL:" + canonicalURL);
	
	storage.get('hrefs', function(object) {
			//console.log(object.hrefs);
			var hrefs = object.hrefs;
			for(p in hrefs) {
				if (href == p || p == canonicalURL) {
					highlight(hrefs[p]);
					return;
				}
			}
			console.log("NOT FOUND!!!");
			for(p in hrefs) {
				console.log (p, hrefs[p])
			}
	});
}

chrome.extension.onMessage.addListener(function (message, sender, callback) {
  if (message.actionCall == "enableTool") {
    enableTool = message.value;
    storage.set({'enableTool': enableTool});
  }
  if (message.actionCall == "enableSoftHighlight") {
    enableSoftHighlight = message.value;
    storage.set({'enableSoftHighlight': enableSoftHighlight});
  }
});

// 3. несколько страниц поиска


// для теста: and ainol novo 7 elf 2 usb характеристики систем -> https://market.yandex.ru/product--planshet-ainol-novo-7-elf-ii/8334063/spec


// - не выделено слово Система
// - характеристики выделено слабо?
// URIError: URI malformed

// что если сначала затегать innerText а потом теги заменить на окраску???