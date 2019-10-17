console.log("ANALYZER!!!");

const falsePositiveResults = [
    "(.*)\\.google\\.(.*)",
    "www\\.youtube\\.com",
    "www\\.blogger\\.com",
    'javascript(.*)'
]

const googleResultsRegExp = new RegExp('\\b(' + falsePositiveResults.join('|') + ')\\b');
const developersRegExp = new RegExp('developers\\.google\\.com');

const storage = chrome.storage.local;

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function getAnchors() {
    var anchors = document.getElementsByTagName('a');
    var result = [];
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (!anchor.href.trim() || (!developersRegExp.test(anchor.hostname) && googleResultsRegExp.test(anchor.hostname))) {
            continue;
        }
        result.push(anchor);
    }
    return result;
}

function isContainsNeighbor(element, neighbors) {
    if (neighbors.includes(element)) {
        return true;
    }

    for (var i = 0; i < element.children.length; ++i) {
        if (isContainsNeighbor(element.children[i], neighbors)) {
            return true;
        }
    }

    return false;
}

function collectWords(element, words) {
    if (element.tagName.toLowerCase() == "b" || element.tagName.toLowerCase() == "em") {
        words.push(element.innerHTML);
    }
    for (var i = 0; i < element.children.length; ++i) {
        collectWords(element.children[i], words);
    }
}

function findSnippetUntilNeighborIsFaced(element, neighbors) {
    // check for contains neighbors in children
    if (isContainsNeighbor(element, neighbors)) {
        return false;
    }

    var words = [];
    collectWords(element, words);
    if (words.length > 0) {
        return words;
    }

    return findSnippetUntilNeighborIsFaced(element.parentElement, neighbors);
}

function analyze() {
    console.log("Start analyzing");
    var startTime = performance.now();
    var anchors = getAnchors();
    var keyWords = [];
    var elements = Array.from(document.querySelectorAll("input"));
    for (let element of elements) {
        if (element.type == 'text' && !isEmpty(element.value)) {
            keyWords = element.value.split(" ");
        }
    }
    var hrefs = {};
    console.log("keyWords:" + keyWords);
    if (anchors) {
        for (var i = 0; i < anchors.length; ++i) {
            var href = anchors[i].href;
            var neighbors = anchors.slice();
            neighbors.splice(i, 1);
            //console.log(href);
            var words = findSnippetUntilNeighborIsFaced(anchors[i], neighbors);
            if (words) {
                hrefs[href] = words.concat(keyWords);
            } else {
                hrefs[href] = keyWords;
            }
        }
    }
    console.log("hrefs:" + hrefs);
    for (var url in hrefs) {
        console.log(url, hrefs[url])
    }
    storage.set({'hrefs': hrefs});
    console.log("Analyzing took " + (performance.now() - startTime) + " milliseconds.");
}

var loaded = false;
window.onload = function () {
    loaded = true;
}

function analyzeByTimer() {
    let timerId = setTimeout(function tick() {
        analyze();
        if (!loaded) {
            timerId = setTimeout(tick, 50);
        }
    }, 50);
}

analyzeByTimer();
