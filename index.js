const express = require("express");
const expressHandlebars = require('express-handlebars')
const path = require("path");
const fs = require('fs');
var urllib = require('urllib');
var JSSoup = require('jssoup').default;
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bcrypt = require('bcryptjs');


const app = express();
const port = process.env.PORT || "8000";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// creating 24 hours from milliseconds.... 10 days
const oneDay = 1000 * 60 * 60 * 24 * 10;

//session middleware
app.use(sessions({
    secret: "kadknk73nk24o!2e!?dfdsf3lpbma2mt4nc",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(cookieParser());



app.get("/", async (req, res) => {
  const jsonData = require("./public/data.json")

  /* if(req.session.userid){ */
  if(true){
    res.render("index.hbs", jsonData)
    res.status(200)
  }else{
    res.render("login.hbs")
    res.status(200)
  }


});

app.post("/login", async (req, res) => {
  const jsonData = require("./public/data.json")

  /* const hash = bcrypt.hashSync(req.body.password, 10);
  console.log(hash) */

  let userData = fs.readFileSync('public/users.json');
  userData = JSON.parse(userData);

  var correct = false
  if(userData[req.body.username]){
    correct = await bcrypt.compare(req.body.password, userData[req.body.username])
  }

  
  if(correct){
    req.session.userid = req.body.username
    res.redirect("/")
    res.status(200)
  }else{
    res.render("login.hbs", {fail: true})
    res.status(200)
  }
});

app.get("/login", async (req, res) => {
    res.redirect("/")
    res.status(200)
});


app.post("/data", async (req, res) => {
  
  /* if(req.session.userid){ */
  if(true){

    const jsonData = require("./public/data.json")
    var list = req.body.list
    var teams = []
    var others = []
    var leagues = []
    var country = {}
    var markets = []

    if(list.length == 18){
      for(var item of list){

        for(var data of jsonData["teams"]){
          if(data[0] == item){
            switch (data[2]) {
              case "InterFootball":
                var tmp = await getInterFootballTeam(data[1])
                tmp["header"] = data[0]
                teams.push(tmp)
                break;
              case "SportOther":
                var tmp = await getOtherTeam(data[1], data[0])
                tmp["header"] = data[0]
                teams.push(tmp)
                break;
              default:
                break;
            }
          }
        }

        for(var data of jsonData["leagues"]){
          if(data[0] == item){
            switch (data[2]) {
              case "InterFootball":
                var mod = {
                  league: await getInterFootballLeague(data[1]),
                  header: data[0]
                }
                leagues.push(mod)
                break;
              case "Hockey":
                var mod = {
                  league: await getInterHockeyLeague(data[1]),
                  header: data[0]
                }
                leagues.push(mod)
                break;
              case "Racing":
                var mod = {
                  league: await getRacingLeague(data[1]),
                  header: data[0]
                }
                leagues.push(mod)
                break;
              default:
                break;
            }
          }
        }

        for(var data of jsonData["country"]){
          if(data[0] == item){
            var mod = {
              country: await getCountry(data[0]),
              header: data[0]
            }
            country = mod
          }
        }

        for(var data of jsonData["other"]){
          if(data[0] == item){
            var mod = {
              other: await getOtherSport(data[0]),
              header: data[0]
            }
            others.push(mod)
          }
        }

        for(var data of jsonData["markets"]){
          if(data[0] == item){
            markets.push(await getMarket(data[0], data[1]))
          }
        }
      }
    }

    const model = {
      teams: teams,
      leagues: leagues,
      others: others,
      country: country,
      markets: markets,
      tv: await getTV(),
    } 

    res.render("data.hbs", model)
    res.status(200)

  }
});

async function getInterFootballTeam(url){
  var res = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var match = {
      "name": "",
      "league": "",
      "day": "",
      "time": "",
      "today": ""
  }
  if(res != "error"){
    var soup = new JSSoup(res);

    if(soup.find("h4", {"class": "fixres__header2"})){
      var result = soup.find("h4", {"class": "fixres__header2"}).text
      match["day"] = soup.find("h4", {"class": "fixres__header2"}).text
      match["league"] = soup.find("h5", {"class": "fixres__header3"}).text
      var data = soup.find("div", {"class": "fixres__item"})
      var data1 = data.findAll("span", {"class": "swap-text--bp30"})
      match["name"] = data1[0].text.trim() +" - "+ data1[1].text.trim()
      match["time"] = data.find("span", {"class": "matches__date"}).text.trim()
      var tmp = match["time"].slice(0,2)
      tmp = parseInt(tmp) + 1
      match["time"] = tmp + match["time"].slice(2)
      if(parseInt(match["day"].split(" ")[1]) == new Date().getDate())
        match["today"] = "1"
      match = fixChar(match)
    }
  }

  if(!match["name"]){
    match["name"] = "Inget event just nu!"
  }

  return match
}

async function getOtherTeam(url, team){
  var res = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var match = {
    "name": "",
    "league": "",
    "day": "",
    "time": "",
    "today": ""
  }
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.find("section", {"id": "coming-matches"})
    var games = table.find("div", {"class": "area"})
    games = games.findAll("div")
    
    var day = ""
    var time = ""
    var name = ""
    for (var d of games){

      if(d.attrs.class.includes('date')){
        day = d.text
      }
      
      if(d.attrs.class.includes('match-box')){
        name = d.find("span", {"class": "home"}).text + " - " + d.find("span", {"class": "away"}).text
        time = d.find("div", {"class": "time"}).text
      }

      if(name.includes(team)){
        break
      }
    }

    if(name.includes(team)){

      match["name"] = name
      match["time"] = time
      match["day"] = day
      
      tmp = new Date().getDate() +"/"+ (new Date().getMonth()+1)

      if(day.split(" ")[1] == tmp)
        match["today"] = "1"
      match = fixChar(match)
    }
    
  }

  if(!match["name"]){
    match["name"] = "Inget event just nu!"
  }

  return match
}


async function getInterFootballLeague(url){
  var res = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    for (var d of table[0].contents[1].contents){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
    }
  }
  return serie
}

async function getInterHockeyLeague(url){
  var res = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    for (var d of table[0].contents[1].contents){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[8].text)
    }
  }

  return serie
}

async function getRacingLeague(url){
  var res = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var f1 = []
  if(res != "error"){
    var soup = new JSSoup(res);
    

    var data = soup.findAll("tr", {"class": "standing-table__row"})
    var index = 0
    for(var x of data){
      if(index > 1){
        var item = x.findAll("td")
        f1.push(item[1].text.trim() + "  " + item[4].text.trim())
      }
      index += 1
      if(index == 22)
        break
    }
  }
  return f1
}


async function getMarket(name, url){
  var stock = await urllib.request(url).then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var market = name

  if(stock != "error"){
    var soup = new JSSoup(stock);
    try {
      var res = soup.findAll('span', {'class': 'mod-ui-data-list__value'})[1].contents[0].contents[1]._text
    } catch (error) {
      var res = "unknown"
    }

    market = market + ": " + res
  }


  return market
}

async function getCountry(country){
  var sports = ["Fotboll","Ishockey","Skidor","Handboll","Friidrott","Innebandy"]
  var result = []
  for (var s of sports){
    var res = await urllib.request('https://www.tvmatchen.nu/'+s+'/').then(function (result) {
    return result.data
    }).catch(function (err) {
    return "error"
    })

    var swe = []
    if(res != "error"){
      var soup = new JSSoup(res);
      //var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})
      var data = soup.findAll("div", {"class": "match-detail"})


      var i = 1
      for (var d of data.slice(0,30)){
          d = d.parent
          var time = d.find("div", {"class": "match-time"}).attrs['content']
          var name = d.find("h3").text
          
          if(name.toLowerCase().includes(country.toLowerCase())){
            var d1 = new Date().getDate()-1
            var d2 = new Date().getDate()-2
            time = d.find("div", {"class": "match-time"}).text
            time = time + ' - ' + d.parent.previousElement.parent.previousElement._text

            if(time.split(' ')[2].includes(d1) || time.split(' ')[2].includes(d2)){
              continue
            }
            if(time.split(' ')[2].includes(d1+1) || time.split(' ').includes("Idag,")){
              if(!(new Date().getHours() > time.slice(0,2)) || time.slice(0,2) == "00")
                swe.push({'time':time, 'name':s+": "+name, 'today': "1"})
              else
                continue
            }else{
              swe.push({'time':time, 'name':s+": "+name, 'today': ""})
            }
          }else{
            continue
          }

          if (i > 1)
              break
          i += 1
      }
    }
    result = result.concat(swe)
    if(result.length > 1)
      break
  }

  if(result.length == 0){
    result.push({'time':"Inget event just nu!", 'name':"", 'today': ""})
  }

  return result.slice(0,2)
}

async function getOtherSport(sport){
  if(sport == "UFC")
    sport = "fighting/ufc"
  if(sport == "Formel 1 Race")
    sport = "motorsport/f1"
  var res = await urllib.request('https://www.tvmatchen.nu/'+sport+'/').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var ufc = []
  if(res != "error"){
    var soup = new JSSoup(res);
    var data = soup.findAll("div", {"class": "match-detail"})
    

    var i = 1
    for (var d of data){
        d = d.parent
        var time = d.find("div", {"class": "match-time"}).attrs['content']
        var name = d.find("h3").text
        var d1 = new Date().getDate()-1
        var d2 = new Date().getDate()-2
        time = d.find("div", {"class": "match-time"}).text
        time = time + ' - ' + d.parent.previousElement.parent.previousElement._text

        if(time.split(' ')[2].includes(d1) || time.split(' ')[2].includes(d2)){
          continue
        }
        if(time.split(' ')[2].includes(d1+1) || time.split(' ').includes("Idag,")){
          if(!(new Date().getHours() > time.slice(0,2)) || time.slice(0,2) == "00")
            ufc.push({'time':time, 'name':name, 'today': "1"})
          else
            continue
        }else{
          ufc.push({'time':time, 'name':name, 'today': ""})
        }

        if (i > 1)
            break
        i += 1
    }
  }

  if(ufc.length == 0){
    ufc.push({'time':"Inget event just nu!", 'name':"", 'today': ""})
  }

  return ufc
}


async function getTV(){
  var tv = ["SVT1", "SVT2", "TV3", "TV4", "Kanal-5"]
  var result = []
  for (var s of tv){
    var res = await urllib.request('https://www.tv.nu/kanal/'+s).then(function (result) {
    return result.data
    }).catch(function (err) {
    return "error"
    })

    var tvRes = {"ch":s, "content": []}
    if(res != "error"){
      var soup = new JSSoup(res);
      //var data = soup.findAll("li", {"class": "js-channel-broadcast"})
      var data = soup.findAll("li", {"class": "_37xCg"})
      
      var tmp = []
      for (var d of data){
          var time = d.find("time").attrs['dateTime']
          time = new Date(time)
 
          if(time.getHours() == 20 && time.getMinutes() == 0 && d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text != undefined){
            tvRes["content"].push("20.00: " + d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text.replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&"))
          }
          if(time.getHours() == 21 && time.getMinutes() == 0 && d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text != undefined){
            tvRes["content"].push("21.00: " + d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text.replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&"))
          }
          if(tmp.length < 2 && d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text != undefined){
            tmp.push((time.getHours() + "." + time.getMinutes() + ": " + d.find("div", {"class": "_1FN79"}).contents[1].contents[0]._text).replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&").replace(".0:", ".00:"))
          }
      }
      if(tvRes["content"].length < 1){
        tvRes["content"] = tmp
      }
    }
    result.push(tvRes)
  }
  return result
}



async function fixChar(data){
  for (const [key, value] of Object.entries(data)) {
    data[key] = data[key].replace(/&#228;/gi, "ä").replace(/&#196;/gi, "Ä").replace(/&#229;/gi, "å").replace(/&#197;/gi, "Å").replace(/&#246;/gi, "ö").replace(/&#214;/gi, "Ö")
  }
  return data
}

app.engine('hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: 'hbs',
  layoutsDir: path.join(__dirname + "/views", 'layouts')
}))

app.set('views', path.join(__dirname, 'views'))


app.use(express.static('public', {
    redirect: false
}))

//PAGE NOT FOUND
app.use(function(request,response){
    response.status(404)
    response.end('<h1>Page Not Found</h1>')
})

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});