function save_settings() {
    var strong = document.getElementById('highlight_color').value;
    var soft = document.getElementById('highlight_soft_color').value;
    chrome.storage.local.set({'strongColor': strong});
    chrome.storage.local.set({'softColor': soft});
    var status = document.getElementById('status');
    status.textContent = 'Saved';
    setTimeout(function () {
        status.textContent = '';
    }, 1000);
}

function load_settings() {
    console.log("load_settings")
    /*  chrome.storage.local.get({
        strongColor: '#F4D03F',
        softColor: '#FFFACD'
      }, function(settings) {
        document.getElementById('highlight_color').value = settings.strongColor;
        document.getElementById('highlight_soft_color').checked = settings.softColor;
      });*/
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
}

document.addEventListener('DOMContentLoaded', load_settings);
document.getElementById('save_settings').addEventListener('click', save_settings);

load_settings();
