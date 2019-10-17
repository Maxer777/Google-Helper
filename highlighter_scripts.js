var STRONG_REPLACEMENT = "<my style=\"background-color: rgb(244, 208, 63);\">$&</my>";
var SOFT_REPLACEMENT = "<my style=\"background-color: rgb(255, 250, 205);\">$&</my>";

var encStrongRegExp;
var strongRegExp;
var softRegExp;
var encSoftRegExp;

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function replaceRecursively(element) {
    //console.log("element.nodeName:" + element.nodeName);
    if (element.nodeType != element.TEXT_NODE) {
        if (element.nodeName == "MY") { // проверка что элемент уже не обновлен подсветкой
            return true;
        }
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
        } else if (encSoftRegExp.test(encodeURIComponent(element.innerText))) {
            regex = encSoftRegExp;
            replacement = SOFT_REPLACEMENT;
        } else if (softRegExp.test(element.textContent)) {
            regex = softRegExp;
            replacement = SOFT_REPLACEMENT;
        }

        if (regex) {
            console.log("before:" + element.textContent);
            var replacementNode = document.createElement('my');
            replacementNode.innerHTML = element.textContent.replace(regex, replacement);
            element.parentNode.insertBefore(replacementNode, element);
            element.parentNode.removeChild(element);
            console.log("after:" + replacementNode.innerHTML);
        }
    }
}

function extractWords(words) {
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
}

function highlight(words) {
    console.log("FOUND!!! highlight:" + words);
    if (words) {
        extractWords(words);


        const kSets = [

            {selectors: 'p, span, dev', color: '#FFFACD'},

            {selectors: 'li, td, dl, dt', color: '#FFFACD'},

            {selectors: 'h1, h2, h3, th, td', color: '#FFFACD'}

        ];

        var t0 = performance.now();
        for (let set of kSets) {
            elements = Array.from(document.querySelectorAll(set.selectors));

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

window.onload = function () {
    console.log("HIGHLIGHER!!!");
    var storage = chrome.storage.local;

    var href = window.location.href;
    var canonicalURL = document.querySelector("link[rel='canonical']") ? document.querySelector("link[rel='canonical']").href : undefined;

    console.log("URL:" + href);
    console.log("canonical URL:" + canonicalURL);

    storage.get('hrefs', function (object) {
        //console.log(object.hrefs);
        var hrefs = object.hrefs;
        for (p in hrefs) {
            if (href == p || p == canonicalURL) {
                highlight(hrefs[p]);
                return;
            }
        }
        console.log("NOT FOUND!!!");
        for (p in hrefs) {
            console.log(p, hrefs[p])
        }
    });

}

// 1. характеристики выделено слабо?
// 2. несколько страниц поиска
// для теста: and ainol novo 7 elf 2 usb характеристики систем -> https://market.yandex.ru/product--planshet-ainol-novo-7-elf-ii/8334063/spec
