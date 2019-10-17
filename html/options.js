function save_settings() {
  var strong = document.getElementById('highlight_color').value;
  var soft = document.getElementById('highlight_soft_color').value;
  chrome.storage.sync.set({
    strongColor: strong,
    softColor: soft
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Saved';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

function load_settings() {
  chrome.storage.sync.get({
    strongColor: '#F4D03F',
    softColor: '#FFFACD'
  }, function(settings) {
    document.getElementById('highlight_color').value = settings.strongColor;
    document.getElementById('highlight_soft_color').checked = settings.softColor;
  });
}

document.addEventListener('DOMContentLoaded', load_settings);
document.getElementById('save_settings').addEventListener('click', save_settings);