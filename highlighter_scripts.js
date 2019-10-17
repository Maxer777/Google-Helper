const STRONG_REPLACEMENT = "<my style=\"background-color: rgb(244, 208, 63);\">$&</my>";
const SOFT_REPLACEMENT = "<my style=\"background-color: rgb(255, 250, 205);\">$&</my>";

const SELECTORS = "p, span, div, li, th, td, dl, dt, h1, h2, h3";

var encStrongRegExp;
var strongRegExp;
var softRegExp;
var encSoftRegExp;

var enableTool = true;
var enableSoftHighlight = true;

var storage = chrome.storage.local;

function replaceRecursively(element) {
    //console.log("element.nodeName:" + element.nodeName);
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
        var regex;
        var replacement;
        if (encStrongRegExp.test(encodeURIComponent(element.innerText))) {
            regex = encStrongRegExp;
            replacement = STRONG_REPLACEMENT;
        } else if (strongRegExp.test(element.textContent)) {
            regex = strongRegExp;
            replacement = STRONG_REPLACEMENT;
        } else if (encSoftRegExp.test(encodeURIComponent(element.innerText)) && enableSoftHighlight) {
            regex = encSoftRegExp;
            replacement = SOFT_REPLACEMENT;
        } else if (softRegExp.test(element.textContent) && enableSoftHighlight) {
            regex = softRegExp;
            replacement = SOFT_REPLACEMENT;
        }

        if (regex && replacement) {
            console.log("before:" + element.textContent);
            var replacementNode = document.createElement('my');
            replacementNode.innerHTML = element.textContent.replace(regex, replacement);
            element.parentNode.insertBefore(replacementNode, element);
            element.parentNode.removeChild(element);
            console.log("after:" + replacementNode.innerHTML);
        }
    }
}

function extractWords(keyWords) {
    var encodedWords = [keyWords.length];
    var softEncodedWords = [];
    var softWords = [];
    for (var i = 0; i < keyWords.length; ++i) {
        encodedWords[i] = encodeURIComponent(keyWords[i]);
        if (keyWords[i] && keyWords[i].length > 2) {
            softWords.push(keyWords[i]);
            softEncodedWords.push(encodeURIComponent(keyWords[i]));
        }
    }

    encStrongRegExp = new RegExp('\\b' + encodedWords.join('\\b|\\b') + '\\b', "ig");
    //console.log('encStrongRegExp:' + '\\b' + encodedWords.join('\\b|\\b') + '\\b');
    strongRegExp = new RegExp('\\b' + keyWords.join('\\b|\\b') + '\\b', "ig");
    //console.log('strongRegExp:' + '\\b' + words.join('\\b|\\b') + '\\b');
    softRegExp = new RegExp(softWords.join('|'), "ig");
    //console.log('softRegExp:' + words.join('|'));
    encSoftRegExp = new RegExp(softEncodedWords.join('|'), "ig");
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function highlight(keyWords) {
    console.log("FOUND!!! key words: " + keyWords);
    if (keyWords) {
        var startTime = performance.now();

        extractWords(keyWords);

        const elements = Array.from(document.querySelectorAll(SELECTORS));
        for (let element of elements) {
            if (!isEmpty(element.innerText)) {
                replaceRecursively(element, encStrongRegExp);
            }
        }

        console.log("Call to highlight took " + (performance.now() - startTime) + " milliseconds.");
    }
}

function removeHighlight() {

}

function loadToolSettings() {
  storage.get('enableTool', function(result){
    enableTool = result.enableTool;
  });
  storage.get('enableSoftHighlight', function(result){
    enableSoftHighlight = result.enableSoftHighlight;
  });
}

window.onload = function () {
    console.log("HIGHLIGHER!!!");
    loadToolSettings();

    var currentURL = window.location.href;
    var currentCanonicalURL = document.querySelector("link[rel='canonical']") ? document.querySelector("link[rel='canonical']").href : undefined;

    console.log("URL:" + currentURL);
    console.log("canonical URL:" + currentCanonicalURL);

    storage.get('hrefs', function (object) {
        var hrefs = object.hrefs;
        for (var p in hrefs) {
            if (currentURL == p || p == currentCanonicalURL) {
                highlight(hrefs[p]);
                return;
            }
        }
        console.log("NOT FOUND!!!");
        for (var p in hrefs) {
            console.log(p, hrefs[p])
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
    removeHighlight();
  }
});
// 1. характеристики выделено слабо?
// 2. несколько страниц поиска
// для теста: and ainol novo 7 elf 2 usb характеристики систем -> https://market.yandex.ru/product--planshet-ainol-novo-7-elf-ii/8334063/spec
