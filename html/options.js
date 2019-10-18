var storage = chrome.storage.local;

function save_settings() {
  var strong = document.getElementById('highlight_color').value;
  var soft = document.getElementById('highlight_soft_color').value;
  var enableTool = document.getElementById('enableTool').checked;
  var enableSoftHighlight = document.getElementById('enableSoftHighlight').checked;
  var scrollToFirst = document.getElementById('scrollToFirst').checked;
  storage.set({'strongColor': strong});
  storage.set({'softColor': soft});
  storage.set({'enableTool': enableTool});
  storage.set({'enableSoftHighlight': enableSoftHighlight});
  storage.set({'scrollToFirst': scrollToFirst});
  var status = document.getElementById('status');
  status.textContent = 'Saved';
  setTimeout(function () {
    status.textContent = '';
  }, 1000);

  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"settings": "updated"});
  });
}

function load_settings() {
    storage.get('strongColor', function (result) {
        var color = result.strongColor;
        if (color == null) {
            color = '#F4D03F';
        }
        document.getElementById('highlight_color').value = color;
    });
    storage.get('softColor', function (result) {
        var color = result.softColor;
        if (color == null) {
            color = '#FFFACD';
        }
        document.getElementById('highlight_soft_color').value = color;
    });
    storage.get('enableTool', function (result) {
      var enableTool = result.enableTool;
      document.getElementById('enableTool').checked = enableTool;
    });
    storage.get('enableSoftHighlight', function (result) {
      var enableSoftHighlight = result.enableSoftHighlight;
      document.getElementById('enableSoftHighlight').checked = enableSoftHighlight;
    });
    storage.get('scrollToFirst', function (result) {
      var scrollToFirst = result.scrollToFirst;
      document.getElementById('scrollToFirst').checked = scrollToFirst;
    });
}


document.addEventListener('DOMContentLoaded', load_settings);
document.getElementById('save_settings').addEventListener('click', save_settings);

load_settings();
