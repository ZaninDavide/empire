// --------------------- UTILITIES ---------------------

function nicerPP(pp){
  let text = pp.toString()
  if(pp >= 1000000) {
    text = (pp/1000000).toPrecision(2).toString() + "mln"
  }else if(pp >= 1000){
    text = Math.round(pp/1000).toString() + "k"
  }
  return text
}

function dist(x1, y1, x2, y2) {
  return Math.round(Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)))
}

function nicerTime(minutes){
  let text = ""
  if(minutes >= 60*24){
    text = (Math.round(minutes / 60 / 24)) + "g"
  }else if(minutes >= 60){
    text = Math.round(minutes / 60) + "h"
  }else{
    text = Math.round(minutes).toString() + "min"
  }
  return text
}

// --------------------- UI ---------------------

function pinButton(x,y,kingdom,name){
  return `
<button class="material-icons" title="Contrassegno privato" onclick="pinForMe(${x},${y},${kingdom},'${name}'); this.style.color='green'; return false;">
    add_location_alt
</button>
`
}

function pinAllyButton(x,y,kingdom,name){
  return `
<button class="material-icons" title="Organizza attacco" onclick="
    if(confirm('Contrassegnare ${x}:${y} per attacco libero?')){
      pinForAlly(${x},${y},${kingdom},'${name}');
      this.style.color='green';
    }"
>
    alarm_add
</button>
`
}

function clear_map_table(){
  map_table.innerHTML = map_table_vuota
  objects = []
}

function clear_ally_table(){
  ally_table.innerHTML = ally_table_vuota
  ally_objects = []
}

// --------------------- COPY & DOWNLOAD ---------------------

function copy_map_table(){
  copyTextToClipboard(JSON.stringify(objects.map(o => {
    return {luogo: o.luogo, posizione: o.posizione, info: o.info}
  })))
}

function download_map_table() {
  const html = map_table.outerHTML.replace(/<button ([^<>]*)>([^<>]*)<\/button>/gm, "")
  download(
    "Mappa.html", 
    `<!DOCTYPE html><html><head><meta charset="UTF-8">${document.getElementById("tableStyle").outerHTML}</head><body>${html}</body></html>`
  )
}

function download_map_table_csv() {
  download(
    "Mappa.csv", 
    'Luogo; Posizione; Info\n' + objects.map(o => {return `${o.luogo};${o.posizione};${o.info}`}).join("\n")
  )
}


function download_ally_table() {
  download(
    "Coalizioni, " + ally1_name + " vs " + ally2_name + ".html", 
    `<!DOCTYPE html><html><head><meta charset="UTF-8">${document.getElementById("tableStyle").outerHTML}</head><body>${ally_table.outerHTML}</body></html>`
  )
}

function download_ally_table_csv() {
  download(
    "Coalizioni, " + ally1_name + " vs " + ally2_name + ".csv", 
    `"Giocatore";"${ally1_name}";"${ally2_name}"\n` + ally_objects.map(o => {return `"${o.player}";"${o.ally1}";"${o.ally2}"`}).join("\n")
  )
}

// --------------------- COPY TO CLIP BOARD ---------------------

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
  
// -------------------------- OPEN TABS ---------------------------

function openTab(event, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  if(event) event.currentTarget.className += " active";
}

openTab({currentTarget: document.getElementById("tabMappaButton")}, "tabMappa")

// -------------------------- DOWNLOAD ---------------------------

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// -------------------------- NOTIFY ---------------------------


function notify(title, text) {
  if (!window.Notification) {
      console.log('Browser does not support notifications.');
  } else {
      // check if permission is already granted
      if (Notification.permission === 'granted') {
          // show notification here
          var notify = new Notification(title, {
            body: text,
            // icon: "https://media.goodgamestudios.com/www/favicon_12.ico",
          });
      } else {
          // request permission from user
          Notification.requestPermission().then(function (p) {
              if (p === 'granted') {
                  // show notification here
                  var notify = new Notification(title, {
                      body: text,
                      // icon: "https://media.goodgamestudios.com/www/favicon_12.ico",
                  });
              } else {
                  console.log('User blocked notifications.');
              }
          }).catch(function (err) {
              console.error(err);
          });
      }
  }
}
