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

const input_x = document.getElementById("inputx")
const input_y = document.getElementById("inputy")
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
const select_castelli = document.getElementById("castelli");
const select_regno = document.getElementById("regno");
const input_message = document.getElementById("input_message");

const map_table = document.getElementById("map_table");
const map_table_vuota = map_table.innerHTML;
const ally_table = document.getElementById("ally_table");
const ally_table_vuota = ally_table.innerHTML;
const reports_table = document.getElementById("reports_table");
const reports_table_vuota = reports_table.innerHTML;
const trenini_table = document.getElementById("trenini_table");
const mercanti_table = document.getElementById("mercanti_table");
const view_report_table = document.getElementById("view_report_table");
const view_report_table_vuota = view_report_table.innerHTML;

const chat_table = document.getElementById("chat_table");

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
// 1037003
// 1038014
// 1039012
// 1040007
// 1040008
// 1041011
// 1042007
// 1044002
// 1045003
// 1045004
// 1045006
// 1047010
// 1048012
// 1049016
// 1050031
// 1050034
// 1051037
// 1052025
// 1052027
// 1053011
// 1053014
// 1053019
// 1054007
// 1055008
// 1057002
// 1059006
// 1060015
// 1061002
// 1062006
// 1063004
// 1064005
// 1065004
// 1073005
// 1074010
// 1075003
// 1078016
// 1085006
// 1086007
// 1087003
// 1089002
// 1090003
// 1090007
// 1091008
// 1092007
// 1093006
const code = 1093006

let myID = -1
let myPP = -1
let myLVL = -1

let objects = []
let ally_objects = []
let reports = []
let comma = []
let pins = []; let pins_taken = false
let castels = []; let castels_filled = false
let mercanti = []

let current_report_id = -1
let current_report_lid = -1
let last_comma = null
let last_mercante_id = null

// events

input_username.addEventListener("keydown", function(e) {
    if (!e) var e = window.event
    if (e.keyCode == 13) input_password.focus()
}, false);

input_password.addEventListener("keydown", function(e) {
    if (!e) var e = window.event
    if (e.keyCode == 13) login()
}, false);

input_message.addEventListener("keydown", function(e) {
  if (!e) var e = window.event
  if (e.keyCode == 13) {
    send_chat_message(input_message.value);
    input_message.value = "";
  }
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

function get_map_object_data(x, y, kingdom = 0) {
  return new Promise((resolve, reject) => {
    const query = x.toString() + ":" + y.toString() + ":" + kingdom.toString();
    get_map_object_promises[query] = {};
    get_map_object_promises[query].resolve = resolve;
    get_map_object_promises[query].reject = reject;
    setTimeout(() => {
      if(
        get_map_object_promises[query] !== undefined &&
        get_map_object_promises[query].reject
      ){
        get_map_object_promises[query].reject();
        delete get_map_object_promises[query];
      }
    }, 5000)
    socket.send(`%xt%EmpireEx_9%gaa%1%{"KID":${kingdom},"AX1":${x},"AY1":${y},"AX2":${x},"AY2":${y}}%`);
  })
}

let get_map_object_promises = {}; // "500:500:0": {resolve:..., reject: ...}
function workMapObjectData(data, kingdom){
  let type = map_objects[data[0]]
  let x = data[1]
  let y = data[2]

  const searchX = parseInt(document.getElementById("inputx").value)
  const searchY = parseInt(document.getElementById("inputy").value)
  
  // const kingdom_select = select_regno.value
  // const kingdom = reverse_kingdoms[kingdom_select];

  const query = x.toString() + ":" + y.toString() + ":" + kingdom.toString();
  if(get_map_object_promises[query] !== undefined && get_map_object_promises[query].resolve){
    get_map_object_promises[query].resolve(data);
    delete get_map_object_promises[query];
    return;
  }
  
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
    case "Castello dei Daymio":
      if(false){
        map_table.innerHTML += oggetto(
          `Castello dei Daymio`,
          `${x}:${y}`,
          ``,
          `${nicerTime(data[5]/60)}`
        )
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
let help_requests_satisfied = true
let tasse_timeout = 0

function workMessage(code, data, line){
  switch(code) {
    case "gaa":
      // map information
      if(data.AI){
        data.AI.forEach(d => workMapObjectData(d, parseInt(data.KID)))
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
      // chat
      if(data.acl && data.acl.CM){
        data.acl.CM.forEach(cur => {
          const now = new Date();
          const time = now.getTime() - 1000*cur.MA;
          const time_date = new Date(time);
          let msg = {
            sender: cur.PN,
            senderID: cur.PID,
            message: cur.MT
              .replace("&145;", "'")
              .replace("e&145;", "è")
              .replace(":))" , '<span class="emoji">😁</span>')
              .replace(":)"  , '<span class="emoji">😀</span>')
              .replace(":-))", '<span class="emoji">😆</span>')
              .replace(":-)" , '<span class="emoji">😃</span>')
              .replace(":("  , '<span class="emoji">🙁</span>')
              .replace(";)"  , '<span class="emoji">😉</span>')
              .replace("^_^" , '<span class="emoji">😄</span>')
              .replace("-.-" , '<span class="emoji">😑</span>')
              .replace("ò.Ó" , '<span class="emoji">🤨</span>')
              .replace("o.O" , '<span class="emoji">🥴</span>')
              .replace("x.x" , '<span class="emoji">😵</span>')
              .replace("X.X" , '<span class="emoji">😵</span>')
              .replace("<3" , '<span class="emoji">❤️</span>')
              .replace("Ciaooo", '<span class="emoji">👋🏻👋🏻👋🏻</span>')
              .replace("ciaooo", '<span class="emoji">👋🏻👋🏻👋🏻</span>')
              .replace("ciaoo" , '<span class="emoji">👋🏻👋🏻</span>')
              .replace("Ciaoo" , '<span class="emoji">👋🏻👋🏻</span>')
              .replace("ciao", '<span class="emoji">👋🏻</span>')
              .replace("Ciao", '<span class="emoji">👋🏻</span>')
              .replace("ok"  , '<span class="emoji">👍🏼</span>'),
            time: `${time_date.getHours().toString().padStart(2,'0')}:${time_date.getMinutes().toString().padStart(2,'0')}`,
          }
          chat_table.insertAdjacentHTML("beforeend", `<tr class="message">
            <td class="sender">${msg.sender}</td>
            <td class="text">${msg.message}</td>
            <td class="orario" style="width:36px;">${msg.time}</td>
          </tr>`)
        })
      }
      // comma & castellani
      if(data.gli){
        // const castellani = data.gli.B
        const comandanti = data.gli.C
        comma = comandanti.map((c, n) => ({
          id: c.ID,
          name: c.N || ("Comandante " + (n+1).toString()),
        }))
        if(castels.length && comma.length && pins_taken) fill_trenini_table()
      }
      // nomi e posizioni dei castelli
      if(data.gcl.C){
        const kingdoms_list = data.gcl.C
        const kingdoms_sort_order = {0:0, 1:2, 2:1, 3:3, 4:4};
        const castels_type_sort_order = {1:1, 4:2};
        kingdoms_list.map(c => {
          const this_kingdom_castels = c.AI
          this_kingdom_castels.forEach(castel => {
            castels.push({
              kingdom: kingdoms[c.KID],
              kingdom_id: c.KID,
              castel_type: castel.AI[0],
              x: castel.AI[1],
              y: castel.AI[2],
              id: castel.AI[3],
              name: castel.AI[10]
            })
          })
          castels.sort((a, b) => {
            let so1 = kingdoms_sort_order[a.kingdom_id];
            let so2 = kingdoms_sort_order[b.kingdom_id];
            if (so1 !== so2) return so1 - so2;
            so1 = castels_type_sort_order[a.castel_type] || 100;
            so2 = castels_type_sort_order[b.castel_type] || 100;
            return so1 - so2;
          });
        })
        if(castels.length && comma.length && pins_taken) fill_trenini_table()
        if(castels.length) { fill_castels(); add_row_mercanti() }
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
      select_castelli.disabled = false
      if(data.MP) myPP = data.MP
      
      socket.send("%xt%EmpireEx_9%gbl%1%{}%") // ask for pins
      socket.send("%xt%EmpireEx_9%txi%1%{}%") // ask for tax info
      socket.send('%xt%EmpireEx_9%aha%1%{"KID":15}%') // give help


      if(!keep_alive_started){
        keep_alive_started = true
        // after one minute this will start sending keep alive messages
        setInterval(() => {
          socket.send("%xt%EmpireEx_9%pin%1%<RoundHouseKick>%")
        }, 60*1000);
      }

      break;
    case "bls":
      // report intermediate
      if(current_report_id === data.MID){
        current_report_id = -1
        current_report_lid = data.LID
        socket.send(`%xt%EmpireEx_9%bld%1%{"LID":${data.LID}}%`)
      }
    case "bld":
      // report data
      if(current_report_lid === data.LID && data.W){
        current_report_lid = -1
        const report_json = { truppe: getTroopsFromReport(data), truppe_cortile: getTroopsCortileFromReport(data) };
        if (desired_action_on_reports === "download") {
          download(prompt("Nome formazione:") + ".gge", JSON.stringify(report_json))
        }else if (desired_action_on_reports === "view") {
          update_report_view(report_json)
        }
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
        pins_taken = true
        if(castels.length && comma.length && pins_taken) fill_trenini_table()
      }
      break;
    case "cra":
      // your leader has started traveling
      if(data.AAM && data.AAM.M && data.AAM.M.TT && data.AAM.UM){
        const leader_id = data.AAM.UM.L.ID
        // const leader_name = data.AAM.UM.L.N
        const leader = comma.filter(c => c.id === leader_id)[0]
        const status_button = document.getElementById("via_" + leader_id)        
        if(leader && leader.resolve) {
          const wait_seconds = data.AAM.M.TT - data.AAM.M.T - 2 // remove 2 seconds
          const orario_arrivo_attacco = new Date((new Date()).getTime() + wait_seconds*1000);
          setTimeout(() => {
            skip_time(data.AAM.M.TA[1], data.AAM.M.TA[2], data.AAM.M.KID)
          }, wait_seconds*1000)
          // add time to status
          status_button.innerText += " (" + nicerMoment(orario_arrivo_attacco) + ")"
        }
      }
    case "cat":
      // your leader is coming back
      if(data.A && data.A.UM && data.A.UM.L) {
        const leader_id = data.A.UM.L.ID
        const leader_name = data.A.UM.L.N
        const leader = comma.filter(c => c.id === leader_id)[0]
        const status_button = document.getElementById("via_" + leader_id)
        if(leader && leader.resolve) {
          const wait_seconds = data.A.M.TT - data.A.M.T + 5 + 5*Math.random() // I add 5-10 seconds
          const orario_arrivo = new Date((new Date()).getTime() + wait_seconds*1000);
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
          status_button.innerText = "IN RITORNO (" + nicerMoment(orario_arrivo) + ")"
          console.log(leader_name + " in ritorno.")
        }
      }
    case "crm":
      if(data.A && data.A.M && data.A.M.MID) {
        const action_id = data.A.M.MID;
        // merchant
        if (last_mercante_id != null){
          const status_button = document.getElementById("mercante_via_" + last_mercante_id);
          const wait_seconds = data.A.M.TT - data.A.M.T;
          const orario_arrivo = new Date((new Date()).getTime() + wait_seconds*1000);
          status_button.style.color = "orange"          
          status_button.innerText += " (" + orario_arrivo.getHours() + ":" + orario_arrivo.getMinutes() + ")"
          mercanti[last_mercante_id].action_id = action_id;
          last_mercante_id = null;
        }else{
          // the merchant is coming back
          const merc = mercanti.filter(m => m.action_id == action_id)[0];
          if(merc && merc.resolve) {
            const status_button = document.getElementById("mercante_via_" + merc.id)
            const wait_seconds = data.A.M.TT - data.A.M.T + 5 + 5*Math.random() // I add 5-10 seconds
            const orario_arrivo = new Date((new Date()).getTime() + wait_seconds*1000);
            setTimeout(() => {
              merc.resolve()
              merc.resolve = undefined
              merc.reject = undefined
            }, wait_seconds*1000)
            // set the status to coming back
            status_button.style.color = "green"
            status_button.innerText = "IN RITORNO (" + orario_arrivo.getHours() + ":" + orario_arrivo.getMinutes() + ")"
            console.log("Mercante " + merc.id + " in ritorno.")
          }
        }
      }
    case "ssu":
      // spy info arrived
      if(data && data.S) {
        const left = data.S[0];
        const mid = data.S[1];
        const right = data.S[2];
        const court = data.S[3];
        if (
          get_spy_info_list[data.AI.X + ":" + data.AI.Y] !== undefined &&
          get_spy_info_list[data.AI.X + ":" + data.AI.Y].resolve !== undefined
        ) {
          get_spy_info_list[data.AI.X + ":" + data.AI.Y].resolve({left, mid, right, court});
          delete get_spy_info_list[data.AI.X + ":" + data.AI.Y];
        }
      }
    case "csm":
      if (data.A && data.A.M.SA) {
        // la spia è arrivata a destinazione,
        // questo non significa che la spiata sia andata bene
        if (
          send_spy_list[data.A.M.SA[1] + ":" + data.A.M.SA[2]] !== undefined &&
          send_spy_list[data.A.M.SA[1] + ":" + data.A.M.SA[2]].resolve !== undefined
        ) {
          send_spy_list[data.A.M.SA[1] + ":" + data.A.M.SA[2]].resolve({travel_time: data.A.M.TT || 0});
          delete send_spy_list[data.A.M.SA[1] + ":" + data.A.M.SA[2]];
        }
      }
    case "irc":
      // pick up offers when they arrive
      setTimeout(() => socket.send("%xt%EmpireEx_9%irc%1%{}%"), 500 + 500*Math.random())
    case "ahh":
      // help ally
      if (data.AC === 0) {
        help_requests_satisfied = false;
        setTimeout(() => {
          if (!help_requests_satisfied) {
            socket.send('%xt%EmpireEx_9%aha%1%{"KID":15}%');
            help_requests_satisfied = true;
          }
        }, 10*1000 + 1546*Math.random())
      }
    case "txi":
      if(data.TX) {
        if(data.TX.TT === -1) {
          // tasse da richiedere
          // RICHIESTA TASSE 10min
          socket.send('%xt%EmpireEx_9%txc%1%{"TR":29}%')
          socket.send('%xt%EmpireEx_9%txs%1%{"TT":0,"TX":3}%')
          // RICHIESTA TASSE 30min; TT = 1
          // RICHIESTA TASSE 1h 30min; TT = 2
          // RICHIESTA TASSE 3h; TT = 3
          // RICHIESTA TASSE 6h; TT = 4
        }else if (data.TX.TT === 0) {
          if(data.TX.RT < 0) {
            // tasse da ritirare
            socket.send('%xt%EmpireEx_9%txc%1%{"TR":29}%')
            socket.send('%xt%EmpireEx_9%txs%1%{"TT":0,"TX":3}%')
          }else{
            // tasse in attesa
            if (tasse_timeout) clearTimeout(tasse_timeout);
            tasse_timeout = setTimeout(() => {
              socket.send('%xt%EmpireEx_9%txc%1%{"TR":29}%')
              socket.send('%xt%EmpireEx_9%txs%1%{"TT":0,"TX":3}%')
            }, data.TX.RT*1001);
          }
        }
      }
    case "txs":
      if(data.txi && data.txi.TX && data.txi.TX.TT & data.txi.TX.TT === -1) {
        // tasse da richiedere
        socket.send('%xt%EmpireEx_9%txc%1%{"TR":29}%')
        socket.send('%xt%EmpireEx_9%txs%1%{"TT":0,"TX":3}%')
      }
    case "acm":
      // chat message arrived
      if(data.CM){
        const now = new Date();
        const time = now.getTime() - 1000*data.CM.MA;
        const time_date = new Date(time);
        let msg = {
          sender: data.CM.PN,
          senderID: data.CM.PID,
          message: data.CM.MT
            .replace("&145;", "'")
            .replace("e&145;", "è")
            .replace(":))" , '<span class="emoji">😁</span>')
            .replace(":)"  , '<span class="emoji">😀</span>')
            .replace(":-))", '<span class="emoji">😆</span>')
            .replace(":-)" , '<span class="emoji">😃</span>')
            .replace(":("  , '<span class="emoji">🙁</span>')
            .replace(";)"  , '<span class="emoji">😉</span>')
            .replace("^_^" , '<span class="emoji">😄</span>')
            .replace("-.-" , '<span class="emoji">😑</span>')
            .replace("ò.Ó" , '<span class="emoji">🤨</span>')
            .replace("o.O" , '<span class="emoji">🥴</span>')
            .replace("x.x" , '<span class="emoji">😵</span>')
            .replace("X.X" , '<span class="emoji">😵</span>')
            .replace("<3" , '<span class="emoji">❤️</span>')
            .replace("Ciaooo", '<span class="emoji">👋🏻👋🏻👋🏻</span>')
            .replace("ciaooo", '<span class="emoji">👋🏻👋🏻👋🏻</span>')
            .replace("ciaoo" , '<span class="emoji">👋🏻👋🏻</span>')
            .replace("Ciaoo" , '<span class="emoji">👋🏻👋🏻</span>')
            .replace("ciao", '<span class="emoji">👋🏻</span>')
            .replace("Ciao", '<span class="emoji">👋🏻</span>')
            .replace("ok"  , '<span class="emoji">👍🏼</span>'),
          time: `${time_date.getHours().toString().padStart(2,'0')}:${time_date.getMinutes().toString().padStart(2,'0')}`,
        }
        if (data.CM.MT.toLowerCase().includes(input_username.value.toLowerCase()) && msg.sender !== input_username.value){
          notify(msg.sender + " ti sta cercando", data.CM.MT)
        }
        chat_table.insertAdjacentHTML("beforeend", `<tr class="message">
          <td class="sender">${msg.sender}</td>
          <td class="text">${msg.message}</td>
          <td class="orario" style="width:36px;">${msg.time}</td>
        </tr>`)
      }
    default:
      break;
  }
}

function workError(code, error_number, line){
  switch(code){
    case "cra":
      console.error("Error " + error_number + ": " + errors[error_number]);
      // un attacco non è riuscito a partire
      last_comma.reject(error_number)
      break;
    case "ssu":
      // I do not show any error since this may be normal
      // console.error("Error " + error_number + ": " + errors[error_number]);
      // could not read espionage result
      // non possiamo sapere quale spionaggio sia stato rifiutato quindi li rigettiamo tutti
      // nella maggior parte dei casi la lista conterrà solo uno spionaggio
      Object.keys(get_spy_info_list).map(key => { if(get_spy_info_list[key].reject !== undefined){
        get_spy_info_list[key].reject(); 
      }})
      get_spy_info_list = {}
      break;
    case "csm":
      console.error("Error " + error_number + ": " + errors[error_number]);
      // non possiamo sapere quale spionaggio sia stato rifiutato quindi li rigettiamo tutti
      // nella maggior parte dei casi la lista conterrà solo uno spionaggio
      Object.keys(send_spy_list).map(key => { if (send_spy_list[key].reject !== undefined){
        send_spy_list[key].reject();
      }})
      send_spy_list = undefined;
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
  select_castelli.disabled = true
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
  select_castelli.disabled = true
  search_progress.style.display = "inline"
  
  const centerX = parseInt(input_x.value)
  const centerY = parseInt(input_y.value)
  const squares = parseInt(document.getElementById("squares").value)
  let kingdom = 0
  
  
  const kingdom_select = select_regno.value
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
      select_castelli.disabled = false
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

// ---------------------- REPORTS ---------------------------

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

function getTroopsCortileFromReport(report_bld_data) {
  return report_bld_data.RW
}

let desired_action_on_reports = "view"; // "view" or "download"
function download_report(report_id) {
  desired_action_on_reports = "download"
  current_report_id = report_id
  socket.send(`%xt%EmpireEx_9%bls%1%{"MID":${report_id},"IM":0}%`)
}
function view_report(report_id) {
  desired_action_on_reports = "view"
  current_report_id = report_id
  socket.send(`%xt%EmpireEx_9%bls%1%{"MID":${report_id},"IM":0}%`)
}

function report_to_html(report){
  let splitted = report.info.split("+")
  let title = report.from || splitted.pop()
  if(enemy_types[title]) title = enemy_types[title]
  const info = nicerTime(report.time)
  return  `
          <tr>
            <td>${title}</td>
            <td>${info}</td>
            <td>
              <button class="material-icons" onclick="download_report(${report.id})">download</button>
              <button class="material-icons" onclick="view_report(${report.id})">open_in_new</button>
            </td>
          </tr>
   `
}

function fill_reports_table() {
  reports.forEach(r => {
    reports_table.innerHTML += report_to_html(r) // TODO
  })
}

function get_troop_name(id) {
  let english_name = items_list.units.filter(truppa => truppa.wodID == id)[0].type;
  let italian_name = translations[(english_name + "_name").toLowerCase()]; // all lowercase
  if (italian_name === undefined){
    let query = (english_name + "_name").substring(0, 1).toLowerCase() + (english_name + "_name").substring(1); // make first letter lowercase
    italian_name = translations[query];
  }
  if (italian_name === undefined){
    italian_name = translations[(english_name + "_name")]; // all lowercase
  }
  return italian_name;
}
function get_tool_name(id) {
  let english_name = items_list.units.filter(strumento => strumento.wodID == id)[0].type;
  let italian_name = translations[(english_name + "_name").toLowerCase()]; // all lowercase
  if (italian_name === undefined){
    let query = (english_name + "_name").substring(0, 1).toLowerCase() + (english_name + "_name").substring(1); // make first letter lowercase
    italian_name = translations[query];
  }
  if (italian_name === undefined){
    italian_name = translations[(english_name + "_name")]; // all lowercase
  }
  return italian_name;
}
function get_troop_info(id) {
  let troop = items_list.units.filter(truppa => truppa.wodID == id)[0];
  return {
    english_name: troop.type,
    italian_name: get_troop_name(id),
    melee_attack: parseInt(troop.meleeAttack) || 0,
    range_attack: parseInt(troop.rangeAttack) || 0,
    melee_defence: parseInt(troop.meleeDefence) || 0,
    range_defence: parseInt(troop.rangeDefence) || 0,
    speed: parseInt(troop.speed),    
    fameAsDef: parseFloat(troop.fameAsDef), // gloria nella morte in difesa
    fameAsOff: parseFloat(troop.fameAsOff), // gloria nella morte in attacco
    food: parseInt(troop.foodSupply),
  }
}

function update_report_view(report_json) {
  let html = view_report_table_vuota;

  report_json.truppe.forEach((ondata, id) => {
    const left_troops =  ondata.L.U.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_troop_name(t[0]) );
    const left_tools =   ondata.L.T.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_tool_name(t[0]) );
    const mid_troops =   ondata.M.U.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_troop_name(t[0]) );
    const mid_tools =    ondata.M.T.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_tool_name(t[0]) );
    const right_troops = ondata.R.U.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_troop_name(t[0]) );
    const right_tools =  ondata.R.T.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_tool_name(t[0]) );
    html += `<tr>
      <td>${id+1}</td>
      <td>${left_troops.join("<br/>")}</td>
      <td>${left_tools.join("<br/>")}</td>
      <td>${mid_troops.join("<br/>")}</td>
      <td>${mid_tools.join("<br/>")}</td>
      <td>${right_troops.join("<br/>")}</td>
      <td>${right_tools.join("<br/>")}</td>
    </tr>`;
  })

  if(report_json.truppe_cortile.filter(t => t[0] !== -1).length > 0){
    html += `<tr>
      <td></td>
      <td colspan="6" style="text-align: center">${report_json.truppe_cortile.filter(t => t[0] !== -1).map(t => t[1] + " × " + get_troop_name(t[0])).join("<br/>")}</td>
    </tr>`;
  }

  view_report_table.innerHTML = html;
}

function read_rapporto(event){
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function(){
    const all_truppe = JSON.parse(reader.result);
    update_report_view(all_truppe);
  };
  reader.readAsText(input.files[0]);
}

// -------------------------------------------------------------

function fill_castels(){
  castels_filled = true
  castels.forEach(c => {
    let option = document.createElement("option")
    option.setAttribute("value", c.name)
    option.innerHTML = c.name
    select_castelli.appendChild(option)
  })
  select_castelli.onchange = e => {
    let c = castels.filter(cc => cc.name == e.target.value)[0]
    if(!c) return false;
    input_x.value = c.x;
    input_y.value = c.y;
    select_regno.value = c.kingdom;
  }
}

// ----------------------------- TRENINI ---------------------------------

let comma_filled = false
function fill_trenini_table(){
  if(comma_filled) return;
  comma_filled = true
  
  let select_from = c => `<select id="from_${c.id}">${castels.map(c => `<option value="${c.name}">${c.name}</option>`)}</select>`
  let select_targets = (c) => {
    let groups = [{name: "Tutti", count: pins.length}]
    pins.forEach(p => {
      let gs = groups.filter(g => g.name === p.name)
      if(gs.length > 0){
        let g = gs[0]
        g.count += 1
      }else{
        groups.push({name: p.name, count: 1})
      }
    })
    return `<select id="targets_${c.id}">${groups.map(group => `<option value="${group.name}">${group.name} (${group.count})</option>`)}</select>`
  }
  let check_piume = c => `<input type="checkbox" id="piume_${c.id}" /><label id="piume_label_${c.id}" for="piume_${c.id}">Piume</label>`
  let check_smart = c => `<input type="checkbox" id="smart_${c.id}" /><label id="smart_label_${c.id}" for="smart_${c.id}">Smart</label>`
  comma.forEach(c => {
    let treno = `
    <tr id="comma_${c.id}">
      <td>${c.name}</td>
      <td><input id="truppe_${c.id}" type="file" accept=".gge,.json,.txt" onchange='read_truppe(event,${c.id})'/></td>
      <td>${select_from(c)}</td>
      <td>${select_targets(c)}</td>
      <td>${check_piume(c)}</td>
      <td>${check_smart(c)}</td>
      <td><button id="via_${c.id}" onclick="start_trenino(${c.id})">AVVIA</button></td>
    </tr>
`
    trenini_table.insertAdjacentHTML('beforeend', treno);
  })
}

function read_truppe(event, comma_id){
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function(){
    let this_comma = comma.filter(c => c.id === comma_id)[0]
    const all_truppe = JSON.parse(reader.result);
    this_comma.truppe = all_truppe.truppe;
    this_comma.truppe_cortile = all_truppe.truppe_cortile;
  };
  reader.readAsText(input.files[0]);
}

function start_trenino(comma_id){
  const start_button = document.getElementById("via_" + comma_id)
  const from_select = document.getElementById("from_" + comma_id)
  const truppe_input = document.getElementById("truppe_" + comma_id)
  const targets_name = document.getElementById("targets_" + comma_id)
  const piume_check = document.getElementById("piume_" + comma_id)
  const smart_check = document.getElementById("smart_" + comma_id)

  start_button.disabled = true
  from_select.disabled = true
  truppe_input.disabled = true
  targets_name.disabled = true
  piume_check.disabled = true
  smart_check.disabled = true
  start_button.style.color = "green"

  let from = castels.filter(c => c.name === from_select.value)[0]
  let comandante = comma.filter(c => c.id === comma_id)[0]
  let troops = comandante.truppe
  let assalto_al_cortile_troops = comandante.truppe_cortile
  let targets = (targets_name.value === "Tutti") ? pins : pins.filter(p => p.name === targets_name.value)
  let piume = piume_check.checked
  let smart = smart_check.checked

  trenino_loop(comma_id, troops, assalto_al_cortile_troops, from, targets, piume, smart, 999)
}

function run_trenino(comandante, troops, assalto_al_cortile_troops, from, target, cavalli, info){
  return new Promise((resolve, reject)=>{
    attack(comandante.id, troops, assalto_al_cortile_troops, from.x, from.y, target.x, target.y, target.kingdom, cavalli)
    console.log(`${comandante.name} ${from.x}:${from.y} → ${target.x}:${target.y} (${from.kingdom})`)

    const status_button = document.getElementById("via_" + comandante.id)
    status_button.style.color = "orange"
    status_button.innerText = "IN VIAGGIO" + info

    comandante.resolve = resolve
    comandante.reject = reject
    last_comma = comandante
  })
}

async function skip_time(x, y, kingdom = 0){
  // console.log(x, y, kingdom);
  const data = await get_map_object_data(x, y, kingdom);
  let total_time_to_skip = data[5] / 60; // minutes
  let time_to_skip = total_time_to_skip; // minutes

  if (time_to_skip > 15*60) {
    console.error("Il tempo d'attesa era superiore a 15h quindi non è stato utilizzato alcun salta-tempo.");
    return;
  }

  while (time_to_skip > 0) {
    let cur_skip = time_skips["1min"];
    let cur_skip_minutes = 1;
    if      (time_to_skip > 24*60) { cur_skip = time_skips["24h"];   cur_skip_minutes = 24*60; }
    else if (time_to_skip >  5*60) { cur_skip = time_skips["5h"];    cur_skip_minutes =  5*60; }
    else if (time_to_skip >  1*60) { cur_skip = time_skips["1h"];    cur_skip_minutes =  1*60; }
    else if (time_to_skip >    30) { cur_skip = time_skips["30min"]; cur_skip_minutes =    30; }
    else if (time_to_skip >    10) { cur_skip = time_skips["10min"]; cur_skip_minutes =    10; }
    else if (time_to_skip >     5) { cur_skip = time_skips["5min"];  cur_skip_minutes =     5; }
    socket.send(`%xt%EmpireEx_9%msd%1%{"X":${x},"Y":${y},"MID":-1,"NID":-1,"MST":${cur_skip},"KID":"${kingdom}"}%`);
    time_to_skip -= cur_skip_minutes;
  }

  if(total_time_to_skip > 0) { console.log("Tempo d'attesa saltato per " + x + ":" + y + ":" + kingdom + " pari a " + nicerTime(total_time_to_skip)); }
}

async function get_smart_troops(troops, assalto_troops, castel_from, target) {
  // calcolo la capacità di difesa dell'avversario 
  let enemy_info = await send_and_get_spy_info(castel_from, target);
  let enemy_defence = {
    left:  {range: 0, melee: 0, count: 0},
    right: {range: 0, melee: 0, count: 0},
    mid:   {range: 0, melee: 0, count: 0},
    court: {range: 0, melee: 0, count: 0},
  }
  enemy_info.left.forEach(unit_and_count => {
    let info = get_troop_info(unit_and_count[0]);
    enemy_defence.left.range += unit_and_count[1] * info.range_defence;
    enemy_defence.left.melee += unit_and_count[1] * info.melee_defence;
    enemy_defence.left.count += unit_and_count[1];
  })
  enemy_info.mid.forEach(unit_and_count => {
    let info = get_troop_info(unit_and_count[0]);
    enemy_defence.mid.range += unit_and_count[1] * info.range_defence;
    enemy_defence.mid.melee += unit_and_count[1] * info.melee_defence;
    enemy_defence.mid.count += unit_and_count[1];
  })
  enemy_info.right.forEach(unit_and_count => {
    let info = get_troop_info(unit_and_count[0]);
    enemy_defence.right.range += unit_and_count[1] * info.range_defence;
    enemy_defence.right.melee += unit_and_count[1] * info.melee_defence;
    enemy_defence.right.count += unit_and_count[1];
  })
  enemy_info.court.forEach(unit_and_count => {
    let info = get_troop_info(unit_and_count[0]);
    enemy_defence.court.range += unit_and_count[1] * info.range_defence;
    enemy_defence.court.melee += unit_and_count[1] * info.melee_defence;
    enemy_defence.court.count += unit_and_count[1];
  })

  // TODO: implementare la strategia EMPTY nel caso non ci fossero truppe su quel fianco
  // se non ci sono truppe avrebbe senso ricadere sulla strategia del cortile
  // se il cortile è vuoto lascerei le cose come sono 
  // scelgo di usare il tipo di truppe opposto a quello che il difensore usa maggiormente
  let my_strategy = {
    L:  enemy_defence.left.melee > enemy_defence.left.range ? "range": "melee",
    R: enemy_defence.right.melee > enemy_defence.right.range ? "range": "melee",
    M:   enemy_defence.mid.melee > enemy_defence.mid.range ? "range": "melee",
    C: enemy_defence.court.melee > enemy_defence.court.range ? "range": "melee",
  }

  // massimizzo il tipo di truppe che ho scelto di usare per ogni lato
  // modifico solamente i fronti dove c'è esattamente un tipo di truppa 
  // da mischia e un tipo di truppa da difesa. Preservo il numero totale 
  // di truppe.
  const fianco_to_name = {L: "left", M: "mid", R: "right", C:"court"};
  let new_troops = {
    troops: troops.map((ondata, n_ondata) => {
      let nuova_ondata = {L: {T:ondata.L.T, U: []}, M: {T:ondata.M.T, U: []}, R:{T:ondata.R.T, U: []}};
      let current_strategy =                    { L: my_strategy.L, M: my_strategy.M, R: my_strategy.R, C: my_strategy.C };
      // il centro passa sempre in massimo due turni quindi dalla terza ondata in poi uso la strategia del cortile
      if (n_ondata + 1 >= 3) current_strategy = { L: my_strategy.L, M: my_strategy.C, R: my_strategy.R, C: my_strategy.C };
      // if (n_ondata + 1 >= 4) current_strategy = { L: my_strategy.C, M: my_strategy.C, R: my_strategy.C, C: my_strategy.C };
      ["L", "M", "R"].forEach(fianco => {
        if (ondata[fianco].U.filter(t => t[0] !== -1).length === 2) {
          const first_troop_info = get_troop_info(ondata[fianco].U[0][0]);
          const second_troop_info = get_troop_info(ondata[fianco].U[1][0]);
          const total_troops_count= ondata[fianco].U[0][1] + ondata[fianco].U[1][1];

          // if the enemy has less than 10% the troops you have we give precedence to the court
          if (enemy_defence[fianco_to_name[fianco]].count < 0.1 * total_troops_count) current_strategy[fianco] = current_strategy.C;

          if (first_troop_info.range_attack > 0 && second_troop_info.range_attack === 0) {
            // 1=range, 2=melee
            if( current_strategy[fianco] === "range" ){
              nuova_ondata[fianco].U = [[ondata[fianco].U[0][0], total_troops_count - 1], [ondata[fianco].U[1][0], 1]];
            }else{
              nuova_ondata[fianco].U = [[ondata[fianco].U[0][0], 1], [ondata[fianco].U[1][0], total_troops_count - 1]];
            }
          }else if (first_troop_info.range_attack === 0 && second_troop_info.range_attack > 0)  {
            // 1=melee, 2=range
            if( current_strategy[fianco] === "range" ){
              nuova_ondata[fianco].U = [[ondata[fianco].U[0][0], 1], [ondata[fianco].U[1][0], total_troops_count - 1]];
            }else{
              nuova_ondata[fianco].U = [[ondata[fianco].U[0][0], total_troops_count - 1], [ondata[fianco].U[1][0], 1]];
            }
          }else{ nuova_ondata[fianco].U = ondata[fianco].U; }
          if (ondata[fianco].U.length > 2) {
            // ci sono degli spazi vuoti nel set
            let repeated = new Array(ondata[fianco].U.length - 2).fill([-1, 0]);
            nuova_ondata[fianco].U = [...nuova_ondata[fianco].U, ...repeated];
          }
        }else{ nuova_ondata[fianco].U = ondata[fianco].U;}

      })
      return nuova_ondata;
    }), 
    assalto_troops: (() => {
      let new_assalto_troops = [];
      if (assalto_troops.length === 2) {
        const first_troop_info = get_troop_info(assalto_troops[0][0]);
        const second_troop_info = get_troop_info(assalto_troops[1][0]);
        const total_troops_count= assalto_troops[0][1] + assalto_troops[1][1];
        if (first_troop_info.range_attack > 0 && second_troop_info.range_attack === 0) {
          // 1=range, 2=melee
          if( my_strategy.C === "range" ){
            new_assalto_troops = [[assalto_troops[0][0], total_troops_count - 1], [assalto_troops[1][0], 1]];
          }else{
            new_assalto_troops = [[assalto_troops[0][0], 1], [assalto_troops[1][0], total_troops_count - 1]];
          }
        }else if (first_troop_info.range_attack === 0 && second_troop_info.range_attack > 0)  {
          // 1=melee, 2=range
          if( my_strategy.C === "range" ){
            new_assalto_troops = [[assalto_troops[0][0], 1], [assalto_troops[1][0], total_troops_count - 1]];
          }else{
            new_assalto_troops = [[assalto_troops[0][0], total_troops_count - 1], [assalto_troops[1][0], 1]];
          }
        }else{ new_assalto_troops = assalto_troops; }
      }else{ new_assalto_troops = assalto_troops; }
      return new_assalto_troops;
    })()
  };
  return new_troops;
}

async function trenino_loop(comma_id, troops, assalto_al_cortile_troops, from, targets, piume, smart, max_counter){
  const comandante = comma.filter(c => c.id === comma_id)[0]
  let counter = 0
  let error_counter = 0
  // limit the number of attacks and consecutive errors allowed
  while(counter < max_counter && error_counter < targets.length){
    const target = targets[counter % targets.length]
    const info = " " + (counter+1).toString();
    const cavalli = piume ? "piume" : "no";
    let this_troops = JSON.parse(JSON.stringify(troops));
    let this_assalto_troops = JSON.parse(JSON.stringify(assalto_al_cortile_troops));
    if (smart) {
      let new_troops = await get_smart_troops(this_troops, this_assalto_troops, from, target);
      this_troops = new_troops.troops;
      this_assalto_troops = new_troops.assalto_troops;
    }
    await skip_time(target.x, target.y, target.kingdom);
    await run_trenino(comandante, this_troops, this_assalto_troops, from, target, cavalli, info).then(() => {
      // on fulfill
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

  if(error_counter >= targets.length){
    // this leader stopped because of too many errors
    console.error(comandante.name + ": questo comandante si è bloccato a causa dei ripetuti errori")
    notify(
      comandante.name + " si è fermato",
      "Impossibile inviare altri attacchi con questo comandante."
    )
  }
  
  if(counter >= max_counter){
    // this leader stopped because of too many errors
    console.log(comandante.name + ": questo comandante ha completato il ciclo di attacchi.")
    notify(
      comandante.name + " ha finito",
      comandante.name + " ha completato il ciclo di attacchi."
    )
  }
}

function attack(leader_id, troops_set, assalto_al_cortile_troops, fromX, fromY, toX, toY, kingdom = 0, cavalli = "no"){
  const piume_field = cavalli === "piume" ? 1 : 0
  const cavalli_monete = cavalli === "monete" ? 1021 : -1
  socket.send(`%xt%EmpireEx_9%cra%1%{"SX":${fromX},"SY":${fromY},"TX":${toX},"TY":${toY},"KID":${kingdom},"LID":${leader_id},"WT":0,"HBW":-1,"BPC":0,"ATT":0,"AV":0,"LP":0,"FC":0,"PTT":${piume_field},"SD":0,"ICA":0,"CD":99,"A":${JSON.stringify(troops_set)},"BKS":[],"AST":[-1,-1,-1],"RW":${JSON.stringify(assalto_al_cortile_troops)},"ASCT":0}%`)
}


// ----------------------------- TRENINI DI RISORSE ---------------------------------
function add_row_mercanti() {
  const mer_id = mercanti.length;
  mercanti[mer_id] = {id: mer_id};
  const merc = mercanti[mer_id];
  let select_from = `<select id="mercante_from_${merc.id}">${castels.map(c => `<option value="${c.name}">${c.name}</option>`)}</select>`
  let select_to = `<select id="mercante_to_${merc.id}">${castels.map(c => `<option value="${c.name}">${c.name}</option>`)}</select>`
  let check_piume = `<input type="checkbox" id="mercante_piume_${merc.id}" /><label id="mercanti_piume_label_${merc.id}" for="mercante_piume_${merc.id}">Piume</label>`
  let risorse = `
    <div style="display: inline-block">Legna: <input type="number" id="mercante_legna_${merc.id}" value="0" min="0"/></div>
    <div style="display: inline-block">Pietra: <input type="number" id="mercante_pietra_${merc.id}" value="0" min="0"/></div>
    <div style="display: inline-block">Cibo: <input type="number" id="mercante_cibo_${merc.id}" value="0" min="0"/></div>
    <hl/>
    <br/>
    <div style="display: inline-block">Carbone: <input type="number" id="mercante_carbone_${merc.id}" value="0" min="0"/></div>
    <div style="display: inline-block">Olio: <input type="number" id="mercante_olio_${merc.id}" value="0" min="0"/></div>
    <div style="display: inline-block">Vetro: <input type="number" id="mercante_vetro_${merc.id}" value="0" min="0"/></div>
    <div style="display: inline-block">Ferro: <input type="number" id="mercante_ferro_${merc.id}" value="0" min="0"/></div>
  `;
  
  mercanti_table.insertAdjacentHTML('beforeend', `
  <tr id="mercante_${merc.id}">
    <td>${select_from}</td>
    <td>${select_to}</td>
    <td>${risorse}</td>
    <td>${check_piume}</td>
    <td><button id="mercante_via_${merc.id}" onclick="start_trenino_mercanti(${merc.id})">AVVIA</button></td>
  </tr>
  `);
}

function start_trenino_mercanti(mercante_id){
  const start_button = document.getElementById("mercante_via_" + mercante_id)
  const from_select = document.getElementById("mercante_from_" + mercante_id)
  const to_select = document.getElementById("mercante_to_" + mercante_id)
  const piume_check = document.getElementById("mercante_piume_" + mercante_id)
  const input_legna = document.getElementById("mercante_legna_" + mercante_id)
  const input_pietra = document.getElementById("mercante_pietra_" + mercante_id)
  const input_cibo = document.getElementById("mercante_cibo_" + mercante_id)
  const input_carbone = document.getElementById("mercante_carbone_" + mercante_id)
  const input_olio = document.getElementById("mercante_olio_" + mercante_id)
  const input_ferro = document.getElementById("mercante_ferro_" + mercante_id)
  const input_vetro = document.getElementById("mercante_vetro_" + mercante_id)

  start_button.disabled = true
  from_select.disabled = true
  to_select.disabled = true
  piume_check.disabled = true
  input_legna.disabled = true
  input_pietra.disabled = true
  input_cibo.disabled = true
  input_carbone.disabled = true
  input_olio.disabled = true
  input_ferro.disabled = true
  input_vetro.disabled = true
  start_button.style.color = "green"

  let castel_from = castels.filter(c => c.name === from_select.value)[0]
  let castel_to = castels.filter(c => c.name === to_select.value)[0]
  let piume = piume_check.checked && true

  let risorse = []
  if (input_legna.value > 0 || input_pietra.value > 0 || input_cibo.value > 0) {
    if(input_legna.value > 0) risorse.push(["W", input_legna.value])
    if(input_pietra.value > 0) risorse.push(["S", input_pietra.value])
    if(input_cibo.value > 0) risorse.push(["F", input_cibo.value])
    input_carbone.value = 0;
    input_olio.value = 0;
    input_ferro.value = 0;
    input_vetro.value = 0;
  }else{
    if(input_carbone.value > 0) risorse.push(["C", input_carbone.value])
    if(input_olio.value > 0) risorse.push(["O", input_olio.value])
    if(input_vetro.value > 0) risorse.push(["G", input_vetro.value])
    if(input_ferro.value > 0) risorse.push(["I", input_ferro.value])
  }

  mercante_loop(mercante_id, castel_from, risorse, castel_to.x, castel_to.y, piume, 999)
  add_row_mercanti()
}

function run_trenino_mercante(mercante_id, castel_from, resources, toX, toY, piume = false, info){
  return new Promise((resolve, reject)=>{
    send_mercante(castel_from, resources, toX, toY, piume)
    console.log(`Mercante ${mercante_id} ${castel_from.name} → ${toX}:${toY}`)

    const status_button = document.getElementById("mercante_via_" + mercante_id)
    status_button.style.color = "orange"
    status_button.innerText = "IN VIAGGIO" + info

    mercanti[mercante_id].resolve = resolve
    mercanti[mercante_id].reject = reject
    last_mercante_id = mercante_id
  })
}

async function mercante_loop(mercante_id, castel_from, resources, toX, toY, piume, max_counter){
  let counter = 0
  let found_error = false;
  // limit the number of attacks and consecutive errors allowed
  while(counter < max_counter && !found_error){
    await run_trenino_mercante(mercante_id, castel_from, resources, toX, toY, piume, ` ${counter}`).then(() => {
      // on fulfill
      counter += 1
      error_counter = 0
    }, (error) => {
      // on reject
      console.error("Merchant " + mercante_id + " error " + error + ": " + errors[error])
      const status_button = document.getElementById("mercante_via_" + mercante_id)
      status_button.style.color = "red"
      status_button.innerText = "Errore: " + errors[error]
      found_error = true;
    })
  }

  if(counter >= max_counter){
    console.log("Mercante " + mercante_id + " ha completato il ciclo di viaggi.")
    notify(
      "Mercante " + mercante_id + " ha finito",
      "Mercante " + mercante_id + " ha completato il ciclo di viaggi."
    )
  }
}

function send_mercante(castel_from, resources, toX, toY, piume = false){
  const piume_field = piume ? 1 : 0
  socket.send(`%xt%EmpireEx_9%crm%1%{"KID":${reverse_kingdoms[castel_from.kingdom]},"SID":${castel_from.id},"TX":${toX},"TY":${toY},"HBW":-1,"PTT":${piume_field},"SD":0,"G":${JSON.stringify(resources)}}%`)
}

// ----------------------------- SPIE ---------------------------------
let get_spy_info_list = {};
async function get_spy_info(kingdom_number, X, Y) {
  socket.send(`%xt%EmpireEx_9%ssi%1%{"TX":${X},"TY":${Y},"KID":${kingdom_number}}%`)
  socket.send(`%xt%EmpireEx_9%gaa%1%{"KID":${kingdom_number},"AX1":${X-5},"AY1":${Y-5},"AX2":${X+5},"AY2":${Y+5}}%`)
  socket.send(`%xt%EmpireEx_9%ssu%1%{"TX":${X},"TY":${Y}}%`)
  return new Promise((resolve, reject) => {
    get_spy_info_list[X + ":" + Y] = {resolve: resolve, reject: reject};
  });
}

let send_spy_list = {};
async function send_spionaggio(castel_from, toX, toY, numero_spie, percentage = 100, piume = false){
  const piume_field = piume ? 1 : 0
  socket.send(`%xt%EmpireEx_9%csm%1%{"SID":${castel_from.id},"TX":${toX},"TY":${toY},"SC":${numero_spie},"ST":0,"SE":${percentage},"HBW":-1,"KID":${reverse_kingdoms[castel_from.kingdom]},"PTT":${piume_field},"SD":0}%`)
  return new Promise((resolve, reject) => {
    send_spy_list[toX.toString() + ":" + toY.toString()] = {resolve: resolve, reject: reject};
  });
}

const delay = ms => new Promise(res => setTimeout(res, ms));
async function send_and_get_spy_info(castel_from, target) {
  const max_counter = 10;
  let i = 0;
  let spia = {travel_time: 0};
  while (i < max_counter) {
    try {
      await delay(2 * spia.travel_time * 1000);
      let info = await get_spy_info(target.kingdom, target.x, target.y);
      return info;
    } catch (error) {
      const numero_spie = 15; // TODO
      try {
        spia = await send_spionaggio(castel_from, target.x, target.y, numero_spie, 100, true);
      } catch (error_send) {}
    } 
    i += 1;
  }
  console.error("Tentativo di spiare " + target.x + ":" + target.y + " fallito dopo " + max_counter + " tentativi.");
  return null;
}

// ---------------------- PINS ----------------------------------

function pinForMe(x, y, kingdom = 0, name = "Posizione"){
  socket.send(`%xt%EmpireEx_9%bad%1%{"K":${kingdom},"X":${x},"Y":${y},"TY":0,"TI":-1,"IM":0,"N":"${name}","M":[]}%`)
}

function pinForAlly(x, y, kingdom = 0, name = "Posizione", minutes = 60){
  let time = minutes * 60
  socket.send(`%xt%EmpireEx_9%bad%1%{"K":${kingdom},"X":${x},"Y":${y},"TY":4,"TI":${time},"IM":0,"N":"${name}","M":[${myID}]}%`)
}

// --------------------------------------------------------------

// ---------------------- CHAT ----------------------------------
function send_chat_message(text){
  text = text.replace(/'/g, "&145;")
  socket.send(`%xt%EmpireEx_9%acm%1%{"M":"${text}"}%`)
}

function privateMessage(player_to, title, text){
  // RN = receiver name,  MH = message header
  socket.send(`%xt%EmpireEx_9%sms%1%{"RN":"${player_to}","MH":"${title}","TXT":"${text}"}%`)
}

const kingdoms = {
  0: "impero",
  1: "sabbie",
  2: "ghiacci",
  3: "vette",
  4: "isole",
}

const reverse_kingdoms = {
  "impero": 0,
  "sabbie": 1,
  "ghiacci": 2,
  "vette": 3,
  "isole": 4,
}

const enemy_types = {
  "-1002": "Castello dei Corvicremisi",
  "-1000": "Feudatario Straniero",
  "-651" : "Accampamento dei Samurai",
  "-601" : "Accampamento Nomade",
  "-411" : "Accampamento dei Leoni",
  "-410" : "Accampamento degli Orsi",
  "-230" : "Fortezza del Deserto",
  "-223" : "Forte della Tempesta",
  "-222" : "Torre delle Vette",
  "-221" : "Torre dei Barbari",
  "-220" : "Torre del Deserto",
  "-205" : "Castello Masnadiero",
  "-204" : "Castello Masnadiero",
  "-811" : "Castello dei Daymio",
  "-801" : "Accampamento del Khan"
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
  37: "Castello dei Daymio",
  28: "Laboratorio",
  26: "Monumento",
  25: "Forte della Tempesta",
  24: "Isola di Risorse",
  11: "Fortezza",
  10: "Villaggio",
  2: "Masnadiero",
  1: "Giocatore"
}

const time_skips = {
  "1min" : "MS1", 
  "5min" : "MS2", 
  "10min": "MS3", 
  "30min": "MS4", 
  "1h"   : "MS5", 
  "5h"   : "MS6", 
  "24h"  : "MS7", 
}

// list of items and units (you may need to change version number) 
// https://empire-html5.goodgamestudios.com/default/items/items_v646.02.json

// list of translations
// https://langserv.public.ggs-ep.com/12@3468/it/*?nodecode=1
