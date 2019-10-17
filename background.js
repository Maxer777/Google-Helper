// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {

  function contextMenuClick(info, tab) {
    chrome.tabs.query({
      "active": true,
      "currentWindow": true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        "actionCall": info.menuItemId,
        "value": info.checked
      });
    });
  }

  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "enableTool",
    title: "Enable",
    type: "checkbox",
    checked: true,
    contexts: ["all"],
    onclick: function(info, tab) {
      contextMenuClick(info, tab);
    }
  });
  chrome.contextMenus.create({
    id: "enableSoftHighlight",
    type: "checkbox",
    title: "Enable Soft Highlight",
    checked: true,
    contexts: ["all"],
    onclick: function(info, tab) {
      contextMenuClick(info, tab);
    }
  });
  chrome.contextMenus.create({
    id: "scrollToFirst",
    type: "checkbox",
    title: "Scroll To First",
    checked: true,
    contexts: ["all"],
    onclick: function(info, tab) {
      contextMenuClick(info, tab);
    }
  });

  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {

    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: 'www.google.(.*)\/search' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});
