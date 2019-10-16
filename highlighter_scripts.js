
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function highlight(words) {
	console.log("highlight:" + words);
  if (words) {
					var encodedWords = [words.length];
					for (var i = 0; i < words.length; ++i) {
						encodedWords[i] = encodeURIComponent(words[i]);
					}
					
                  var encStrongRegExp = new RegExp('\\b' + encodedWords.join('\\b|\\b') + '\\b', "ig");
				  console.log('encStrongRegExp:' + '\\b' + encodedWords.join('\\b|\\b') + '\\b');
                  var strongRegExp = new RegExp('\\b' + words.join('\\b|\\b') + '\\b', "ig");
				  console.log('strongRegExp:' + '\\b' + words.join('\\b|\\b') + '\\b');
                  var softRegExp = new RegExp(words.join('|'), "ig");
				  console.log('softRegExp:' + words.join('|'));

                  const kSets = [

                               {selectors: 'p, span, dev', color: '#FFFACD'},

                               {selectors: 'li, td', color: '#FFFACD'},

                               {selectors: 'h1, h2, h3, th, td', color: '#FFFACD'}

                  ];

				var t0 = performance.now();
                  for (let set of kSets) {
                               elements = Array.from(document.querySelectorAll(set.selectors));

                               for (let element of elements) {
								   if (!isEmpty(element.innerText)) {
										if (encStrongRegExp.test(encodeURIComponent(element.innerText))) {
										   element.innerHTML = decodeURIComponent(encodeURIComponent(element.innerHTML).replace(encStrongRegExp, "<my style=\"background-color: rgb(244, 208, 63);\">\$&</my>"));
										} else if (strongRegExp.test(element.innerText)) {
										   element.innerHTML = element.innerHTML.replace(strongRegExp, "<my style=\"background-color: rgb(244, 208, 63);\">\$&</my>");
										} else if (softRegExp.test(element.innerText)) {
										   element.innerHTML = element.innerHTML.replace(softRegExp, "<my style=\"background-color: rgb(255, 250, 205);\">\$&</my>");
										}

									}
								}
					}
				var t1 = performance.now();
				console.log("Call to highlight took " + (t1 - t0) + " milliseconds.");
		}
}

window.onload = function() {
	console.log("HIGHLIGHER!!!");
                var storage = chrome.storage.local;

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
								break;
							}
							console.log (p, hrefs[p])
						}
                });
				
}
 
// 1. не подсвечивается на developers.google.com
// 2. сьехала верстка "ainol novo 7 elf 2 характеристики" -> https://market.yandex.ru/product--planshet-ainol-novo-7-elf-ii/8334063/spec - похоже модифицирует href ы

