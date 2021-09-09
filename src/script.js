let socket = new WebSocket("wss://ep-live-mz-int2-es1-it1-game.goodgamestudios.com/");

const query_lab = document.getElementById("lab");
const query_monu = document.getElementById("monu");
const query_forti80 = document.getElementById("forti80");
const query_forti70 = document.getElementById("forti70");
const query_forti40 = document.getElementById("forti40");
const query_isole_acqua = document.getElementById("isole_acqua");
const query_isole = document.getElementById("isole");
const query_rovine = document.getElementById("rovine");
const query_player_free = document.getElementById("player_free");
const query_ghost = document.getElementById("ghost");
const query_villi = document.getElementById("villi_free");
const query_masna = document.getElementById("masna");
const query_distance_ava = document.getElementById("distance_ava");
const query_fortezze = document.getElementById("fortezze");

const input_username = document.getElementById("username");
const input_password = document.getElementById("password");
const login_button = document.getElementById("login_button");
const search_progress = document.getElementById("search_progress");
const search_button = document.getElementById("search_button");
const ally_button = document.getElementById("ally_button");
const input_ally1 = document.getElementById("input_ally1");
const input_ally2 = document.getElementById("input_ally2");
const input_vicini = document.getElementById("input_vicini");
const input_livello_ghost = document.getElementById("input_livello_ghost");

const map_table = document.getElementById("map_table");
const map_table_vuota = map_table.innerHTML;
const ally_table = document.getElementById("ally_table");
const ally_table_vuota = ally_table.innerHTML;
const reports_table = document.getElementById("reports_table");
const reports_table_vuota = reports_table.innerHTML;
const trenini_table = document.getElementById("trenini_table");

let ally1_id = 1
let ally2_id = 2
let ally1_name = "Coalizione 1"
let ally2_name = "Coalizione 2"
let ally1_data = {}
let ally2_data = {}

/* GAME */

// 1033007
// 1033014
// 1034012
// 1035009
// 1035010
// 1036015
const code = 1036015

let myID = -1
let myPP = -1
let myLVL = -1

let objects = []
let ally_objects = []
let reports = []
let comma = []
let pins = []
let castels = []

let current_report_id = -1
let current_report_lid = -1
let last_comma = null

// events

input_username.addEventListener("keydown", function(e) {
    if (!e) var e = window.event
    if (e.keyCode == 13) input_password.focus()
}, false);

input_password.addEventListener("keydown", function(e) {
    if (!e) var e = window.event
    if (e.keyCode == 13) login()
}, false);

// functions

function oggetto(luogo, posizione, pins, info){
  objects.push({
    luogo, posizione, info
  })
  return  `
          <tr>
            <td>${luogo}</td>
            <td>${posizione}${pins}</td>
            <td>${info}</td>
          </tr>
   `
}

function workMapObjectData(data){
  let type = map_objects[data[0]]
  let x = data[1]
  let y = data[2]

  const searchX = parseInt(document.getElementById("inputx").value)
  const searchY = parseInt(document.getElementById("inputy").value)
  
  let kingdom = 0
  const kingdom_select = document.getElementById("regno").value
  if(kingdom_select === "impero") kingdom = 0
  if(kingdom_select === "sabbie") kingdom = 1
  if(kingdom_select === "ghiacci") kingdom = 2
  if(kingdom_select === "vette") kingdom = 3
  if(kingdom_select === "isole") kingdom = 4
  
  switch (type) {
    case "Forte della Tempesta":
      if(data[8] !== 0) break; // this fort is not there
      let fort_lives = 10 - data[7]
      let fort_levels = {
        0: 40,
        1: 50,
        2: 60,
        3: 70,
        4: 80,
      }
      let fort_level = fort_levels[data[5] % 5]
      if(
        (fort_level === 80 && query_forti80.checked) ||
        (fort_level === 70 && query_forti70.checked) || 
        (fort_level < 70 && query_forti40.checked)
      ){
        map_table.innerHTML += oggetto(
          `${type} ${fort_level}`,
          `${x}:${y}`,
          `${pinButton(x,y,4,type)}`,
          `Vite: <b>${fort_lives}</b><br/><i>${dist(x,y,searchX, searchY)}km</i>`
        )
      }
      break;
    case "Laboratorio":
      if(query_lab.checked){
        let libero_occupato = !data[8] ? "libero" : "occupato"
        map_table.innerHTML += oggetto(
          `${type}`,
          `${x}:${y}`,
          `${pinButton(x,y,1,type)}`,
          `${libero_occupato}`
        )
      }
      break;
    case "Monumento":
      if(query_monu.checked){
        let monument_size = data[5] === 0 ? "piccolo" : "grande"
        let monument_level = data[6]
        let libero_occupato = data[10] === "" ? "libero" : "occupato"
        map_table.innerHTML += oggetto(
          `${type} ${monument_level}`,
          `${x}:${y}`,
          `${pinButton(x,y,1,type)}`,
          `${monument_size}, lvl. ${monument_level}, ${libero_occupato}`
        )
      }
      break;
    case "Villaggio":
      if(query_villi.checked){
        let libero = !data[8]
        let materiali = {0: "legna", 1: "pietra", 2: "cibo"}
        if(libero){
          map_table.innerHTML += oggetto(
            `${type}`,
            `${x}:${y}`,
            `${pinButton(x,y,data[6],type)}`,
            `${materiali[data[5]]}`
          )
        }
      }
      break;
    case "Isola di Risorse":
      let libera = !data[6]
      let time = data[9] / 1000 / 60
      const risorse = {
        1: "legna grande",
        2: "pietra grande",
        3: "acquamarina grande",
        4: "legna",
        5: "pietra",
        6: "acquamarina",
      }
      const risorsa = risorse[data[8]]
      const acqua = risorsa==="acquamarina" || risorsa==="acquamarina grande"
      if((query_isole_acqua.checked && acqua) || query_isole.checked){
        if(time === 0){
            map_table.innerHTML += oggetto(
              `${acqua ? "Isola di Acquamarina" : type}`, 
              `${x}:${y}`,
              `${pinButton(x,y,4,type)}`,
              `${risorsa}<br/>${dist(x,y,searchX, searchY)}km`
            )
        }
      }
      break;  
    case "Masnadiero":
      if(query_masna.checked){
        map_table.innerHTML += oggetto(
          `Masnadiero ${data[4] + 1}`,
          `${x}:${y}`,
          ``,
          `${dist(x,y,searchX, searchY)}km`
        )
      }
      break;
    case "Fortezza":
      if(query_fortezze.checked){
        let hours = Math.floor(data[5] / 60 / 60)
        let minutes = Math.floor(data[5] / 60) % 60
        // let killer_id = data[6]
        if(hours === 0 && minutes === 0){
          // you can attack it now
          map_table.innerHTML += oggetto(
            `Fortezza`,
            `${x}:${y}`,
            `${pinButton(x,y,kingdom,type)}`,
            `Libero<br/>${dist(x,y,searchX, searchY)}km`
          )
        }else{
          // when will it be attackable again?
          const now = new Date();
          let total_minutes = 60*(now.getHours() + hours) + now.getMinutes() + minutes;
          if(total_minutes > 24*60*60) total_minutes -= 24*60*60
          let time_hours = Math.floor(total_minutes / 60)
          let time_minutes = Math.floor(total_minutes % 60)
          if(time_hours > 24) time_hours -= 24
          if(time_hours < 10) time_hours = "0" + time_hours.toString()
          if(time_minutes < 10) time_minutes = "0" + time_minutes.toString()
          map_table.innerHTML += oggetto(
            `Fortezza`,
            `${x}:${y}`,
            `${pinButton(x,y,kingdom,`${type} ${time_hours}:${time_minutes}`)}`,
            `<b>${time_hours}:${time_minutes}</b> = ${hours ? hours + "h " : ""}${minutes}min<br/><i>${dist(x,y,searchX, searchY)}km</i>`
          )
        }
      }
      break;
    default:
      break;  
  }
}

function workMapPlayerData(data){
  let numero_ava = data.AP.filter(c => c[0] === 0).length - 1
  if(data.R === 1 && numero_ava > 0 && !data.AN && query_rovine.checked){
    map_table.innerHTML += oggetto(
      `Rovina`,
      `${data.N}`,
      ``,
      `avamposti: ${numero_ava}, lvl. ${data.L || 0} leg. ${data.LL || 0}, p.p. ${nicerPP(data.MP)}, ${data.AN || "senza coalizione"}`
    )
  }else if(!data.AN && query_player_free.checked){
    map_table.innerHTML += oggetto(
      `Giocatore`,
      `${data.N}`,
      ``,
      `avamposti: ${numero_ava}, lvl. ${data.L || 0} leg. ${data.LL || 0}, p.p. ${nicerPP(data.MP)}, ${data.R === 1 ? "in rovine, " : ""}${data.AN || "senza coalizione"}`
    )
  }else if(query_ghost.checked && data.LL && data.LL >= input_livello_ghost.value && data.MP < 600_000 && !data.R){
    map_table.innerHTML += oggetto(
      `Ghost ${nicerPP(data.MP)}`,
      `${data.N}`,
      ``,
      `avamposti: ${numero_ava}, lvl. ${data.L || 0} leg. ${data.LL || 0}, p.p. ${nicerPP(data.MP)}, ${data.AN || "senza coalizione"}`
    )
  }
}

let keep_alive_started = false

function workMessage(code, data, line){
  switch(code) {
    case "gaa":
      // map information
      if(data.AI){
        data.AI.forEach(d => workMapObjectData(d))
      }
      if(data.OI){
        data.OI.forEach(d => workMapPlayerData(d))
      }
      break;
    case "gbd":
      // player id
      if(data.gpi) myID = data.gpi.PID
      // inbox
      if(data.sne && data.sne.MSG){
        let msg = data.sne.MSG.map(m => ({
            id: m[0],
            type: msg_types[m[1]],
            info: m[2],
            from: m[3],
            archived: m[7] === 1,
            time: m[5] / 60,
        }))
        reports = msg.filter(m => m.type === "Battaglia") // attacks & reports
        fill_reports_table()
      }
      // comma & castellani
      if(data.gli){
        // const castellani = data.gli.b
        const comandanti = data.gli.G
        comma = comandanti.map((c, n) => ({
          id: c.ID,
          name: c.N || ("Comandante " + (n+1).toString()),
        }))
        if(castels.length & comma.length) fill_trenini_table()
      }
      // nomi e posizioni dei castelli
      if(data.gcl.C){
        const kingdoms = data.gcl.C
        kingdoms.map(c => {
          const this_kingdom_castels = c.AI
          this_kingdom_castels.forEach(castel => {
            castels.push({
              kingdom: castel.KID,
              x: castel.AI[1],
              y: castel.AI[2],
              name: castel.AI[10]
            })
          })
        })
        if(castels.length & comma.length) fill_trenini_table()
      }
    case "hgh":
      if(ally1_id === -1 || ally2_id === -1) workAllysList(data)
    case "ain":
      if(ally1_data === null || ally2_data === null) workAlly(data)
    case "gmu":
      login_button.innerHTML = `ACCESSO RIUSCITO`
      login_button.disabled = true
      input_username.disabled = true
      input_password.disabled = true
      search_button.disabled = false
      ally_button.disabled = false
      if(data.MP) myPP = data.MP
      
      socket.send("%xt%EmpireEx_9%gbl%1%{}%") // ask for pins

      if(!keep_alive_started){
        keep_alive_started = true
        // after one minute this will start sending keep alive messages
        setInterval(() => {
          socket.send("%xt%EmpireEx_9%pin%1%<RoundHouseKick>%")
        }, 60*1000);
      }

      break;
    case "bls":
      // report intermidiate
      if(current_report_id === data.MID){
        current_report_id = -1
        current_report_lid = data.LID
        socket.send(`%xt%EmpireEx_9%bld%1%{"LID":${data.LID}}%`)
      }
    case "bld":
      // report data
      if(current_report_lid === data.LID && data.W){
        current_report_lid = -1
        download(prompt("Nome formazione:") + ".gge", JSON.stringify(getTroopsFromReport(data)))
      }
      break;
    case "gbl":
      if(data.BL){
        pins = data.BL.map(p => ({
          name: p.N, 
          x: p.X,
          y: p.Y,
          kingdom: p.K,
        }))
      }
      break;
    case "cat":
      // your leader is coming back
      if(data.A && data.A.UM && data.A.UM.L) {
        const leader_id = data.A.UM.L.ID
        const leader_name = data.A.UM.L.N
        const leader = comma.filter(c => c.id === leader_id)[0]
        const status_button = document.getElementById("via_" + leader_id)
        if(leader && leader.resolve) {
          const wait_seconds = data.A.M.TT - data.A.M.T + 5 + 5*Math.random() // I add 5-10 seconds
          setTimeout(() => {
            leader.resolve()
            leader.resolve = undefined
            leader.reject = undefined
            // set the status to coming back
            status_button.style.color = "black"
            status_button.innerText = "LIBERO"
          }, wait_seconds*1000)
          // set the status to coming back
          status_button.style.color = "green"
          status_button.innerText = "IN RITORNO"
          console.log(leader_name + " in ritorno.")
        }
      }
    case "irc":
      setTimeout(() => socket.send("%xt%EmpireEx_9%irc%1%{}%"), 500 + 500*Math.random())
    default:
      break;
  }
}

function workError(code, error_number, line){
  switch(code){
    case "cra":
      // un attacco non è riuscito a partire
      last_comma.reject(error_number)
      break;
    default:
      break;
  }
}

function batchSend(commands) {
  commands.forEach(c => socket.send(c))
}

socket.onmessage = function(event) {
  event.data.text().then(res => {
    let info = res.split("%")
    let code = info[2]
    let data // = JSON.parse(info[5])
    let is_error = false
    try{
      data = JSON.parse(info[5])
    }catch{
      data = info[4]
      is_error = true
    }
    
    if(!is_error){
      workMessage(code, data, res)
    }else{
      workError(code, data, res)
    }
  })
};

socket.onopen = function(e) {
  console.log("[open] Connection established");
  
  batchSend([
    `<msg t='sys'><body action='verChk' r='0'><ver v='166' /></body></msg>`,
    `<msg t='sys'><body action='login' r='0'><login z='EmpireEx_9'><nick><![CDATA[]]></nick><pword><![CDATA[${code}%it%0]]></pword></login></body></msg>`,
    `<msg t='sys'><body action='autoJoin' r='-1'></body></msg>`,
    `<msg t='sys'><body action='roundTrip' r='1'></body></msg>`,
    `%xt%EmpireEx_9%vck%1%${code}%web-html5%<RoundHouseKick>%5.026744302892756e+307%`
  ])
  
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
  login_button.innerHTML = `CONNESSIONE CHIUSA`
  login_button.disabled = true
  login_button.style.color = "red"
  search_button.disabled = true
  ally_button.disabled = true
};

socket.onerror = function(error) {
  console.log(`[error] ${error.message}`);
};

// LOGIN
function login(){
  let name = input_username.value
  let pass = input_password.value
  socket.send(`%xt%EmpireEx_9%lli%1%{"CONM":668,"RTM":81,"ID":0,"PL":1,"NOM":"${name}","PW":"${pass}","LT":null,"LANG":"it","DID":"0","AID":"1608229252410140027","KID":"","REF":"https://empire.goodgamestudios.com","GCI":""}%`)
}

// SEARCH IN THE MAP
function requestLargeMap(){
  search_button.disabled = true
  search_progress.style.display = "inline"
  
  const centerX = parseInt(document.getElementById("inputx").value)
  const centerY = parseInt(document.getElementById("inputy").value)
  const squares = parseInt(document.getElementById("squares").value)
  let kingdom = 0
  
  
  const kingdom_select = document.getElementById("regno").value
  if(kingdom_select === "impero") kingdom = 0
  if(kingdom_select === "sabbie") kingdom = 1
  if(kingdom_select === "ghiacci") kingdom = 2
  if(kingdom_select === "vette") kingdom = 3
  if(kingdom_select === "isole") kingdom = 4

  
  const squaresX = squares
  const squaresY = squares
  
  let marginLeft = centerX - squaresX*50/2
  let marginTop = centerY - squaresY*50/2
  
  search_progress.value = 0
  search_progress.max = squares*squares

  
  let directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0] // down right up left
  ]
  let cur_direction = 0
  let direction_counter = -1
  let direction_goal = 1
  let second = false
  let cells_counter = 0 
  
  let recursive = (x, y) => {
    let curX1 = marginLeft + 50*x
    let curY1 = marginTop + 50*y
    let curX2 = marginLeft + 50*(x+1)
    let curY2 = marginTop + 50*(y+1)
    socket.send(`%xt%EmpireEx_9%gaa%1%{"KID":${kingdom},"AX1":${curX1},"AY1":${curY1},"AX2":${curX2},"AY2":${curY2}}%`)

    search_progress.value += 1
    cells_counter += 1
    direction_counter += 1
    
    if(cells_counter === squaresX * squaresY){
      search_button.disabled = false
      search_progress.style.display = "none"
      return;
    }else if (direction_counter === direction_goal) {
      // change direction
      cur_direction = (cur_direction + 1) % directions.length
      if(!second){
        // end of first with this goal length
        second = true
        direction_counter = 0
      }else{
        // end of second with this goal length
        second = false
        direction_counter = 0
        direction_goal += 1
      }
    }
    setTimeout(() => recursive(x + directions[cur_direction][0], y + directions[cur_direction][1]), 500);
  }
  
  recursive(Math.round(squaresX/2 - 1), Math.round(squaresY/2 - 1))
}

// ANALYSE ALLY
function analyseAlly(){
  ally1_id = -1
  ally2_id = -1
  ally1_name = ""
  ally2_name = ""
  ally1_data = null
  ally2_data = null
  clear_ally_table()
  
  input_ally1.disabled = true
  input_ally2.disabled = true
  input_vicini.disabled = true
  ally_button.disabled = true
  query_distance_ava.disabled = true
  
  const n1 = parseInt(input_ally1.value)
  const n2 = parseInt(input_ally2.value)
  
  socket.send(`%xt%EmpireEx_9%hgh%1%{"LT":11,"LID":6,"SV":"${n1}"}%`)
  socket.send(`%xt%EmpireEx_9%hgh%1%{"LT":11,"LID":6,"SV":"${n2}"}%`)
}
function workAllysList(data){
  data.L.forEach(ally => {
    const ally_rank = ally[0]
    const ally_id = ally[2][0]
    const ally_name = ally[2][1]
    if(ally_rank === parseInt(input_ally1.value)) {
      ally1_id = ally_id
      ally1_name = ally_name
    }
    if(ally_rank === parseInt(input_ally2.value)) {
      ally2_id = ally_id
      ally2_name = ally_name
    }
  })
  if(ally1_id !== -1 && ally2_id !== -1){
    ally_table.innerHTML = `<tr><th>GIOCATORE</th><th>${ally1_name}</th><th>${ally2_name}</th></tr>`
    socket.send(`%xt%EmpireEx_9%ain%1%{"AID":${ally1_id}}%`)
    socket.send(`%xt%EmpireEx_9%ain%1%{"AID":${ally2_id}}%`)
  }
}
function workAlly(data){
  if(!data.A) return
  
  let ally_id = data.A.AID
  if(ally_id === ally1_id && ally1_data === null) {
    ally1_data = data.A
  }
  if(ally_id === ally2_id && ally2_data === null) {
    ally2_data = data.A
  }
  if(ally1_data !== null && ally1_data.M && ally2_data !== null && ally2_data.M) {
    // FILL THE TABLE
    let membri1 = ally1_data.M
    let membri2 = ally2_data.M

    let places1 = []
    membri1.forEach(m => {
      m.AP.filter(p => p[0] === 0 && (p[4] === 1 || p[4] === 4)).sort((a, b) => a[4] - b[4]).forEach(p => {
        places1.push({ x: p[2], y: p[3], type: p[4] === 1 ? "cp" : "ava", player: m.N, pp: m.MP })
      })  
    })
    let places2 = []
    membri2.forEach(m => {
      m.AP.filter(p => p[0] === 0 && (p[4] === 1 || p[4] === 4)).sort((a, b) => a[4] - b[4]).forEach(p => {
        places2.push({ x: p[2], y: p[3], type: p[4] === 1 ? "cp" : "ava", player: m.N, pp: m.MP })
      })  
    })
    
    let workMembro = function(m) {
      let html1 = ""
      let html2 = ""
      
      m.AP.filter(pp => pp[0] === 0 && (pp[4] === 1 || (pp[4] === 4 && query_distance_ava.checked))).sort((a, b) => a[4] - b[4]).forEach(p => { 
        let place = { x: p[2], y: p[3], type: p[4] === 1 ? "cp" : "ava", player: m.N, pp: m.MP }
        let dist2 = (pl) => Math.pow(place.x-pl.x,2) + Math.pow(place.y-pl.y,2)
        let dist = (pl) => Math.round(Math.sqrt(Math.pow(place.x-pl.x,2) + Math.pow(place.y-pl.y,2)))
        
        // trovo gli n=input_vicini.value ally1 più vicini
        let ally1_nearest = places1.filter(pla => pla.player !== place.player).sort((a,b) => {
          return dist2(a) - dist2(b)
        }).slice(0, input_vicini.value).map(n => {
          return "<b>" + dist(n) + " → " + n.player + "</b> " + nicerPP(n.pp) + " - <i>" + n.type + " " + n.x + ":" + n.y + "</i>"
        }).join("<br/>")
        
        // trovo gli n=input_vicini.value ally2 più vicini
        let ally2_nearest = places2.filter(pla => pla.player !== place.player).sort((a,b) => {
          return dist2(a) - dist2(b)
        }).slice(0, input_vicini.value).map((n) => {
          return "<b>" + dist(n) + " → " + n.player + "</b> " + nicerPP(n.pp) + " - <i>" + n.type + " " + n.x + ":" + n.y + "</i>"
        }).join("<br/>")
        
        html1 += place.type + " " + place.x + ":" + place.y + "<br/>" + ally1_nearest + "<br/><br/>"
        html2 += place.type + " " + place.x + ":" + place.y + "<br/>" + ally2_nearest + "<br/><br/>"
        
      })
      
      let color1 = m.AN === ally1_name ? "def" : "att"
      let color2 = m.AN === ally1_name ? "att" : "def"
      
      ally_table.innerHTML += giocatore(
        `<span class="def"><b>${m.N}</b><br/><b>${nicerPP(m.MP)}</b><br/><i>L ${m.L} LL ${m.LL}</i><br/>${m.AN}</span>`,
        `<span class="${color1}">${html1}</span>`,
        `<span class="${color2}">${html2}</span>`,
      )
      
      ally_objects.push({
        player: `${m.N}\n${nicerPP(m.MP)}\nL ${m.L} LL ${m.LL}\n${m.AN}`.replaceAll("<br/>", "\n").replaceAll(/<[^>]*>/ig, "").trim(),
        ally1: html1.replaceAll("<br/>", "\n").replaceAll(/<[^>]*>/ig, "").trim(),
        ally2: html2.replaceAll("<br/>", "\n").replaceAll(/<[^>]*>/ig, "").trim(),
      })
      
    }

    ally_table.innerHTML += giocatore(`<h3>${ally1_name}</h3>`,"<b class=\"def\">ALLEATI</b>", "<b class=\"att\">NEMICI</b>")
    membri1.forEach(workMembro)      
    ally_table.innerHTML += giocatore(`<h3>${ally2_name}</h3>`,"<b class=\"att\">NEMICI</span", "<b class=\"def\">ALLEATI</b>")
    membri2.forEach(workMembro)
    
    // DONE - RESET
    ally1_id = 1
    ally2_id = 2
    ally1_data = {}
    ally2_data = {}
    
    ally_button.disabled = false
    input_ally1.disabled = false
    input_ally2.disabled = false
    input_vicini.disabled = false
    query_distance_ava.disabled = false
  } 
}

function giocatore(player, def, att){
  return  `
          <tr>
            <td>${player}</td>
            <td>${def}</td>
            <td>${att}</td>
          </tr>
   `
}

// --------------------------------------------------------------

function getTroopsFromReport(report_bld_data) {
  if(!report_bld_data || !report_bld_data.W) return false

  const troops = report_bld_data.W.map(w => {
    const mine = w[0] // [ ID, LEFT_TROOPS, MIDDLE, RIGHT ]
    const rm_last = c => c.slice(0, c.length - 1)
    const complete_array = (arr, size) => {
      while(arr.length < size){
        arr.push([-1,0])
      }
      return arr
    }
    let left = {T: complete_array(mine[1][1].map(rm_last), 2), U: complete_array(mine[1][0].map(rm_last), 2)} // {T: tools_left, U: troops_left}
    let middle = {T: complete_array(mine[2][1].map(rm_last), 3), U: complete_array(mine[2][0].map(rm_last), 5)} // {T: tools_middle, U: troops_middle}
    let right = {T: complete_array(mine[3][1].map(rm_last), 2), U: complete_array(mine[3][0].map(rm_last), 2)} // {T: tools_right, U: troops_right}
    return {
      L: left,
      R: right,
      M: middle,
    }
  })

  return troops
}

function download_report(report_id) {
  current_report_id = report_id
  socket.send(`%xt%EmpireEx_9%bls%1%{"MID":${report_id},"IM":0}%`)
}

function report(report){
  let splitted = report.info.split("+")
  let title = report.from || splitted.pop()
  if(enemy_types[title]) title = enemy_types[title]
  const info = nicerTime(report.time)
  return  `
          <tr>
            <td>${title}</td>
            <td>${info}</td>
            <td><button class="material-icons" onclick="download_report(${report.id})">download</button></td>
          </tr>
   `
}

function fill_reports_table() {
  reports.forEach(r => {
    reports_table.innerHTML += report(r) // TODO
  })
}

// ----------------------------- TRENINI ---------------------------------

function fill_trenini_table(){
  let select_from = c => `<select id="from_${c.id}">${castels.map(c => `<option value="${c.name}">${c.name}</option>`)}</select>`
  comma.forEach(c => {
    let treno = `
    <tr id="comma_${c.id}">
      <td>${c.name}</td>
      <td><input id="truppe_${c.id}" type="file" accept=".gge,.json,.txt" onchange='read_truppe(event,${c.id})'/></td>
      <td>${select_from(c)}</td>
      <td>Luoghi contrassegnati</td>
      <td><button id="via_${c.id}" onclick="start_trenino(${c.id})">AVVIA</button></td>
    </tr>
`
    trenini_table.innerHTML += treno
  })
}

function read_truppe(event, comma_id){
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function(){
    comma.filter(c => c.id === comma_id)[0].truppe = JSON.parse(reader.result);
  };
  reader.readAsText(input.files[0]);
}

function start_trenino(comma_id){
  const start_button = document.getElementById("via_" + comma_id)
  const from_select = document.getElementById("from_" + comma_id)
  const truppe_input = document.getElementById("truppe_" + comma_id)

  start_button.disabled = true
  from_select.disabled = true
  truppe_input.disabled = true
  start_button.style.color = "green"

  let from = castels.filter(c => c.name === from_select.value)[0]
  let comandante = comma.filter(c => c.id === comma_id)[0]
  let troops = comandante.truppe
  let targets = pins
  
  trenino_loop(comma_id, troops, from, targets, 999)
}

function run_trenino(comandante, troops, from, target, info){
  return new Promise((resolve, reject)=>{
    attack(comandante.id, troops, from.x, from.y, target.x, target.y, target.kingdom, false)
    console.log(`${comandante.name} ${from.x}:${from.y} → ${target.x}:${target.y}`)

    const status_button = document.getElementById("via_" + comandante.id)
    status_button.style.color = "orange"
    status_button.innerText = "IN VIAGGIO" + info

    comandante.resolve = resolve
    comandante.reject = reject
    last_comma = comandante
  })
}

async function trenino_loop(comma_id, troops, from, targets, max_counter){
  const comandante = comma.filter(c => c.id === comma_id)[0]
  let counter = 0
  let error_counter = 0
  // limit the number of attacks and consecutive errors allowed
  while(counter < max_counter && error_counter < targets.length){
    const target = targets[counter % targets.length]
    const info = " (" + (counter+1) + ")"
    await run_trenino(comandante, troops, from, target, info).then(() => {
      // on fullfill
      counter += 1
      error_counter = 0
    }, (error) => {
      // on reject
      console.error(comandante.name + " error " + error + ": " + errors[error])
      const status_button = document.getElementById("via_" + comandante.id)
      status_button.style.color = "red"
      status_button.innerText = "Errore: " + errors[error]
      counter += 1
      error_counter += 1
    })
  }
}

function attack(leader_id, troops_set, fromX, fromY, toX, toY, kingdom = 0, piume = false){
  socket.send(`%xt%EmpireEx_9%cra%1%{"SX":${fromX},"SY":${fromY},"TX":${toX},"TY":${toY},"KID":${kingdom},"LID":${leader_id},"WT":0,"HBW":-1,"BPC":0,"ATT":0,"AV":0,"LP":0,"FC":0,"PTT":${piume ? "1" : "0"},"SD":0,"ICA":0,"CD":99,"A":${JSON.stringify(troops_set)},"BKS":[]}%`)
}

// --------------------------------------------------------------

function pinForMe(x, y, kingdom = 0, name = "Posizione"){
  socket.send(`%xt%EmpireEx_9%bad%1%{"K":${kingdom},"X":${x},"Y":${y},"TY":0,"TI":-1,"IM":0,"N":"${name}","M":[]}%`)
}

function pinForAlly(x, y, kingdom = 0, name = "Posizione", minutes = 60){
  let time = minutes * 60
  socket.send(`%xt%EmpireEx_9%bad%1%{"K":${kingdom},"X":${x},"Y":${y},"TY":4,"TI":${time},"IM":0,"N":"${name}","M":[${myID}]}%`)
}

// --------------------------------------------------------------

const enemy_types = {
  "-1000": "Feudatario Straniero",
  "-601": "Accampamento Nomade",
  "-411": "Accampamento dei Leoni",
  "-230": "Fortezza del Deserto",
  "-223": "Forte della Tempesta",
  "-221": "Torre dei Barbari",
  "-205": "Castello Masnadiero",
}

const msg_types = {
  1: "Messaggio ricevuto",
  2: "Messaggio inviato",
  3: "Spionaggio",
  6: "Battaglia",
  22: "Messaggio collettivo",
  67: "Nessuna battaglia",
  95: "Messaggio di sistema",
}

const map_objects = {
  28: "Laboratorio",
  26: "Monumento",
  25: "Forte della Tempesta",
  24: "Isola di Risorse",
  11: "Fortezza",
  10: "Villaggio",
  2: "Masnadiero",
  1: "Giocatore"
}