console.log("HIGHLIGHER!!!");

const STRONG_CSS = "ghs_strong";
const SOFT_CSS = "ghs_soft";
const STRONG_TAG = "my_strong";
const SOFT_TAG = "my_soft";
const STRONG_REPLACEMENT = "<"+STRONG_TAG+" class=\""+STRONG_CSS+"\">\$&</"+STRONG_TAG+">";
const SOFT_REPLACEMENT = "<"+SOFT_TAG+" class=\""+SOFT_CSS+"\">\$&</"+SOFT_TAG+">";

const SELECTORS = "p, span, div, li, th, td, dl, dt, h1, h2, h3";

var strongRegExp;
var softRegExp;

var enableTool = true;
var enableSoftHighlight = true;
var scrollToFirst = true;

var storage = chrome.storage.local;

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function replaceRecursively(element) {
    if (element.nodeName == "SCRIPT") { // skip script nodes
        return;
    }
    if (element.nodeName == "MY") { // проверка что элемент уже не обновлен подсветкой
        return;
    }
    if (element.nodeType != element.TEXT_NODE) {
        for (var i = 0; i < element.childNodes.length; ++i) {
            replaceRecursively(element.childNodes[i]);
        }
    } else {
        //console.log("before:" + element.textContent);
        var isReplaced = false;
        if (strongRegExp.test(element.textContent)) {
            //console.log("strong");
            element.textContent = element.textContent.replace(strongRegExp, STRONG_REPLACEMENT);
            isReplaced = true;
        }
        if (softRegExp.test(element.textContent)) {
            //console.log("soft");
            element.textContent = element.textContent.replace(softRegExp, SOFT_REPLACEMENT);
            isReplaced = true;
        }
        if (isReplaced) {
            var replacementNode = document.createElement('my');
            replacementNode.innerHTML = element.textContent;
            element.parentNode.insertBefore(replacementNode, element);
            element.parentNode.removeChild(element);
            //console.log("after:" + replacementNode.innerHTML);
        }
    }
}

function extractWords(keyWords) {
    var softWords = [];
    for (var i = 0; i < keyWords.length; ++i) {
        if (keyWords[i] && keyWords[i].length > 2) {
            softWords.push(keyWords[i]);
        }
    }

    strongRegExp = new RegExp("(?<=(\\s|^|\\!|\\\\|\\\"|\\#|\\$|\\%|\\&|\\'|\\(|\\)|\\*|\\+|\\,|\\-|\\.|\\/|\\:|\\;|\\<|\\=|\\>|\\?|\\@|\\[|\\]|\\^|\\_|\\`|\\{|\\||\\}|\\~))(" + keyWords.join('|') + ")(?=(\\s|$|\\!|\\\\|\\\"|\\#|\\$|\\%|\\&|\\'|\\(|\\)|\\*|\\+|\\,|\\-|\\.|\\/|\\:|\\;|\\<|\\=|\\>|\\?|\\@|\\[|\\]|\\^|\\_|\\`|\\{|\\||\\}|\\~))", "ig");
    console.log('strongRegExp:' + strongRegExp.toString());
    softRegExp = new RegExp("(?<!\\>)" + softWords.join('(?!\\<)|(?<!\\>)') + "(?!\\<)", "ig");
    console.log('softRegExp:' + softRegExp.toString());
}

function highlightKeyWords(keyWords) {
    console.log("FOUND!!! key words: " + keyWords);
    if (keyWords) {
        var startTime = performance.now();

        extractWords(keyWords);

        const elements = Array.from(document.querySelectorAll(SELECTORS));
        console.log("elements " + elements.length);
        for (let element of elements) {
            if (!isEmpty(element.innerText)) {
                replaceRecursively(element);
            }
        }

        console.log("Highlighting took " + (performance.now() - startTime) + " milliseconds.");
    }
}

function removeHighlight(cssClass) {
  var elements = document.querySelectorAll("." + cssClass);
  for (var element of elements) {
    element.classList.remove(cssClass);
  }
}

function addHighlight(cssClass) {
  var elements;
  if (cssClass === STRONG_CSS) {
    elements = document.querySelectorAll(STRONG_TAG);
  } else {
    elements = document.querySelectorAll(SOFT_TAG);
  }
  for (var element of elements) {
    element.classList.add(cssClass);
  }
}

function loadToolSettings() {
    storage.get('enableTool', function (result) {
        enableTool = result.enableTool;
    });
    storage.get('enableSoftHighlight', function (result) {
        enableSoftHighlight = result.enableSoftHighlight;
    });
    storage.get('scrollToFirst', function (result) {
      scrollToFirst = result.scrollToFirst;
    });
    storage.get('highlight_color', function (result) {
      var color = result.highlight_color;
      if (color !== null) {
        console.log('highlight color', color);
      }
    });
}

function scrollToFirstElement() {
  var element = document.querySelector("." + STRONG_CSS);
  if (element !== null) {
    element.scrollIntoView();
  }
}

function highlight() {
    loadToolSettings();

    var currentURL = window.location.href;
    var currentCanonicalURL = document.querySelector("link[rel='canonical']") ? document.querySelector("link[rel='canonical']").href : undefined;

    console.log("URL:" + currentURL);
    console.log("canonical URL:" + currentCanonicalURL);

    storage.get('hrefs', function (object) {
        var urlToKeyWordsMap = object.hrefs;
        for (var url in urlToKeyWordsMap) {
            if (currentURL == url || url == currentCanonicalURL) {
                highlightKeyWords(urlToKeyWordsMap[url]);
                if (scrollToFirst) {
                  scrollToFirstElement();
                }
                return;
            }
        }
        console.log("NOT FOUND!!!");
        for (var url in urlToKeyWordsMap) {
            console.log(url, urlToKeyWordsMap[url])
        }
    });
}

chrome.extension.onMessage.addListener(function (message, sender, callback) {
  if (message.actionCall === "enableTool") {
    enableTool = message.value;
    storage.set({'enableTool': enableTool});
    if (enableTool) {
      addHighlight(STRONG_CSS);
      addHighlight(SOFT_CSS);
    } else {
      removeHighlight(STRONG_CSS);
      removeHighlight(SOFT_CSS);
    }
  }
  if (message.actionCall === "enableSoftHighlight") {
    enableSoftHighlight = message.value;
    storage.set({'enableSoftHighlight': enableSoftHighlight});
    if (enableSoftHighlight) {
      addHighlight(SOFT_CSS);
    } else {
      removeHighlight(SOFT_CSS);
    }
  }
  if (message.actionCall === "scrollToFirst") {
    scrollToFirst = message.value;
    storage.set({'scrollToFirst': scrollToFirst});
    if (scrollToFirst) {
      scrollToFirstElement();
    }
  }
});

var loaded = false;
window.onload = function () {
    loaded = true;
}

function highlightByTimer() {
    let timerId = setTimeout(function tick() {
        if (loaded) {
            highlight();
        } else {
            highlight();
            timerId = setTimeout(tick, 300);
        }
    }, 300);
}

highlightByTimer();

// для теста: and ainol novo 7 elf 2 usb характеристики систем -> https://market.yandex.ru/product--planshet-ainol-novo-7-elf-ii/8334063/spec

// 1. fast switch between search keywords(optional)​
// 2. highlighting and features customization
// 3. javascript map size -> https://javascript.info/map-set