const express = require("express");
const expressHandlebars = require('express-handlebars')
const path = require("path");
const fs = require('fs');
var urllib = require('urllib');
var JSSoup = require('jssoup').default;



const app = express();
const port = process.env.PORT || "8000";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", async (req, res) => {

  res.render("index.hbs")
  res.status(200)
});

app.get("/data", async (req, res) => {

  const model = {
    milan: await getMilan(),
    lfc: await getLFC(),
    iko: await getIKO(),
    brynäs: await getBrynäs(),
    shl: await getSHL(),
    seriea: await getSerieA(),
    pl: await getPL(),
    div1: await getDIV1(),
    market: await getMarket(),
    ufc: await getUFC(),
    space: await getSpaceX(),
    f1: await getF1(),
    f1stand: await getF1Standing(),
    sweden: await getSweden(),
  } 

  res.render("data.hbs", model)
  res.status(200)
});

async function getMilan(){
  var res = await urllib.request('https://www.skysports.com/ac-milan-fixtures').then(function (result) {
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

  return match
}

async function getLFC(){
  var res = await urllib.request('https://www.skysports.com/liverpool-fixtures').then(function (result) {
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

  return match
}

async function getIKO(){
  var res = await urllib.request('https://www.oddevold.org?firstRef').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var match = {
      "name": "",
      "time": "",
      "today": ""
  }
  if(res != "error"){
    var soup = new JSSoup(res);
    
    match["name"] = soup.find("b", {"class": "pageHeaderUpcomingEvents__title"}).text.trim()
    match["time"] = soup.find("span", {"class": "pageHeaderUpcomingEvents__time"}).text.trim()
    var tmp = new Date()
    var str = tmp.getFullYear() + ", " + match["time"]
    var time = new Date(str)
    match["time"] = time.toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    if(time.getDate() == new Date().getDate())
      match["today"] = "1"
    match = fixChar(match)
  }

  return match
}

async function getBrynäs(){
  var res = await urllib.request('https://www.brynas.se/spelschema/SHL_2021_regular').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var match = {
      "name": "",
      "day": "",
      "time": "",
      "today": ""
  }
  if(res != "error"){
    var soup = new JSSoup(res);
    
    var data = soup.find("div", {"data-game-mode": "upcoming"})
      if (data != 'None'){
          var tmp = data.findAll("div", {"class": "rmss_c-schedule-game__team-name"})
          var i = 0
          for (var x of tmp){
              if (i==0)
                  match["name"] = x.text + "-"
              if (i==2)
                  match["name"] += x.text
              i += 1
          }
          match["day"] = data.attrs["data-game-date"]
          var day = new Date(match["day"])
          match["day"] = day.toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric' })
          match["time"] = data.find("div", {"class": "rmss_c-schedule-game__start-time"}).text
          if(day.getDate() == new Date().getDate())
            match["today"] = "1"
      }
    match = fixChar(match)
  }

  return match
}

async function getSHL(){
  var res = await urllib.request('https://tabellen.se/hockey/shl').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    var index = 0
    for (var d of table[0].contents){
      if(index != 0){
        serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[8].text)
      }
      index += 1
    }
  }

  return serie
}

async function getSerieA(){
  var res = await urllib.request('https://tabellen.se/fotboll/serie-a').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    var index = 0
    for (var d of table[0].contents){
      if(index != 0){
        serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
      }
      index += 1
    }
  }
  return serie
}

async function getPL(){
  var res = await urllib.request('https://tabellen.se/fotboll/premier-league').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    var index = 0
    for (var d of table[0].contents){
      if(index != 0){
        serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
      }
      index += 1
    }
  }
  return serie
}

async function getDIV1(){
  var res = await urllib.request('https://tabellen.se/fotboll/division-1-sodra').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var serie = []
  if(res != "error"){
    var soup = new JSSoup(res);

    var table = soup.findAll("table", {"class": "table"})
    var index = 0
    for (var d of table[0].contents){
      if(index != 0){
        serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
      }
      index += 1
    }
  }
  return serie
}

async function getMarket(){
  var DowJones = await urllib.request('https://se.investing.com/indices/us-30').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })
  var OMXS30 = await urllib.request('https://se.investing.com/indices/omx-stockholm-30').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var market = [
      "Dow Jones: ",
      "OMXS30: "
    ]

  if(DowJones != "error" && OMXS30 != "error"){
    var soup = new JSSoup(DowJones);
    var dow = soup.find('span', {'data-test': 'instrument-price-change-percent'}).text.trim()

    var soup = new JSSoup(OMXS30);
    var omx = soup.find('span', {'data-test': 'instrument-price-change-percent'}).text.trim()

    market = [
      "Dow Jones: " + dow,
      "OMXS30: " + omx
    ]
  }


  return market
}

async function getUFC(){
  var res = await urllib.request('https://www.tvmatchen.nu/fighting/').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var ufc = []
  if(res != "error"){
    var soup = new JSSoup(res);
    var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})


    var i = 1
    for (var d of data){
        var time = d.find("div", {"class": "match-time"}).attrs['content']
        time = new Date(time).toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        var name = d.find("h3", {"itemprop": "name"}).text
        var tmp = new Date(time).setYear(new Date().getFullYear())
        if(new Date(tmp).getTime() < new Date().getTime())
          continue
        if(new Date(tmp).getDate() == new Date().getDate())
          ufc.push({'time':time, 'name':name, 'today': "1"})
        else
          ufc.push({'time':time, 'name':name, 'today': ""})
        if (i > 1)
            break
        i += 1
    }
  }

  return ufc
}

async function getSpaceX(){
  var res = await urllib.request('https://spacecoastlaunches.com/launch-list/').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var flight = {
      "name": "",
      "day": "",
      "time": "",
      "today": ""
  }
  if(res != "error"){
    var soup = new JSSoup(res);


    var data = soup.find("div", {"class": "three_fourth"})
    data = data.findAll("p")
    flight["day"] = data[0].text.trim()
    var day = new Date(flight["day"].replace("Date:", ""))
    flight["day"] = day.toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric' })
    flight["name"] = data[1].text.trim()
    flight["time"] = data[4].text.trim()
    if(day.getDate() == new Date().getDate())
      flight["today"] = "1"
  }
  
  return flight
}

async function getF1(){
  var res = await urllib.request('https://www.tvmatchen.nu/motorsport/f1/').then(function (result) {
  return result.data
  }).catch(function (err) {
  return "error"
  })

  var f1 = []
  if(res != "error"){
    var soup = new JSSoup(res);
    var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})


    var i = 1
    for (var d of data){
        var time = d.find("div", {"class": "match-time"}).attrs['content']
        time = new Date(time).toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        var name = d.find("h3", {"itemprop": "name"}).text
        if(new Date(time).getTime() < new Date().getTime())
          continue
        if(new Date(time).getDate() == new Date().getDate())
          f1.push({'time':time, 'name':name, 'today': "1"})
        else
          f1.push({'time':time, 'name':name, 'today': ""})
        if (i > 1)
            break
        i += 1
    }
  }
  return f1
}

async function getF1Standing(){
  var res = await urllib.request('https://www.skysports.com/f1/standings').then(function (result) {
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

async function getSweden(){
  var sports = ["Fotboll","Ishockey","Handboll","Skidor","Friidrott","Innebandy"]
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
      var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})

      var i = 1
      for (var d of data.slice(0,30)){
          var time = d.find("div", {"class": "match-time"}).attrs['content']
          time = new Date(time).toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
          var name = d.find("h3", {"itemprop": "name"}).text
          var tmp = new Date(time).setYear(new Date().getFullYear())
          if(!name.toLowerCase().includes("sverige") || new Date(tmp).getTime() < new Date().getTime())
            continue
          if(new Date(tmp).getDate() == new Date().getDate())
            swe.push({'time':time, 'name':s+": "+name, 'today': "1"})
          else
            swe.push({'time':time, 'name':s+": "+name, 'today': ""})
          if (i > 1)
              break
          i += 1
      }
    }
    result = result.concat(swe)
    if(result.length > 1)
      break
  }
  return result.slice(0,2)
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