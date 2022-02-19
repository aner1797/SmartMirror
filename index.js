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
  } 

  res.render("index.hbs", model)
  res.status(200)
});

async function getMilan(){
  var res = await urllib.request('https://www.skysports.com/ac-milan-fixtures').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var match = {
      "name": "",
      "league": "",
      "day": "",
      "time": ""
  }

  var result = soup.find("h4", {"class": "fixres__header2"}).text
  match["day"] = soup.find("h4", {"class": "fixres__header2"}).text
  match["league"] = soup.find("h5", {"class": "fixres__header3"}).text
  var data = soup.find("div", {"class": "fixres__item"})
  var data1 = data.findAll("span", {"class": "swap-text--bp30"})
  match["name"] = data1[0].text.trim() +" - "+ data1[1].text.trim()
  match["time"] = data.find("span", {"class": "matches__date"}).text.trim()
  match = fixChar(match)

  return match
}

async function getLFC(){
  var res = await urllib.request('https://www.skysports.com/liverpool-fixtures').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var match = {
      "name": "",
      "league": "",
      "day": "",
      "time": ""
  }

  var result = soup.find("h4", {"class": "fixres__header2"}).text
  match["day"] = soup.find("h4", {"class": "fixres__header2"}).text
  match["league"] = soup.find("h5", {"class": "fixres__header3"}).text
  var data = soup.find("div", {"class": "fixres__item"})
  var data1 = data.findAll("span", {"class": "swap-text--bp30"})
  match["name"] = data1[0].text.trim() +" - "+ data1[1].text.trim()
  match["time"] = data.find("span", {"class": "matches__date"}).text.trim()
  match = fixChar(match)

  return match
}

async function getIKO(){
  var res = await urllib.request('https://www.oddevold.org?firstRef').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var match = {
      "name": "",
      "time": ""
  }
  
  match["name"] = soup.find("b", {"class": "pageHeaderUpcomingEvents__title"}).text.trim()
  match["time"] = soup.find("span", {"class": "pageHeaderUpcomingEvents__time"}).text.trim()
  match = fixChar(match)

  return match
}

async function getBrynäs(){
  var res = await urllib.request('https://www.brynas.se/spelschema/SHL_2021_regular').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var match = {
      "name": "",
      "day": "",
      "time": ""
  }
  
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
        match["time"] = data.find("div", {"class": "rmss_c-schedule-game__start-time"}).text
    }
  match = fixChar(match)
  return match
}

async function getSHL(){
  var res = await urllib.request('https://tabellen.se/hockey/shl').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var serie = []

  var table = soup.findAll("table", {"class": "table"})
  var index = 0
  for (var d of table[0].contents){
    if(index != 0){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[8].text)
    }
    index += 1
  }
  return serie
}

async function getSerieA(){
  var res = await urllib.request('https://tabellen.se/fotboll/serie-a').then(function (result) {
  return result.data
  })

 var soup = new JSSoup(res);
  var serie = []

  var table = soup.findAll("table", {"class": "table"})
  var index = 0
  for (var d of table[0].contents){
    if(index != 0){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
    }
    index += 1
  }
  return serie
}

async function getPL(){
  var res = await urllib.request('https://tabellen.se/fotboll/premier-league').then(function (result) {
  return result.data
  })

 var soup = new JSSoup(res);
  var serie = []

  var table = soup.findAll("table", {"class": "table"})
  var index = 0
  for (var d of table[0].contents){
    if(index != 0){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
    }
    index += 1
  }
  return serie
}

async function getDIV1(){
  var res = await urllib.request('https://tabellen.se/fotboll/division-1-sodra').then(function (result) {
  return result.data
  })

 var soup = new JSSoup(res);
  var serie = []

  var table = soup.findAll("table", {"class": "table"})
  var index = 0
  for (var d of table[0].contents){
    if(index != 0){
      serie.push(d.contents[0].text+": "+d.contents[1].text+" "+d.contents[7].text)
    }
    index += 1
  }
  return serie
}

async function getMarket(){
  var DowJones = await urllib.request('https://se.investing.com/indices/us-30').then(function (result) {
  return result.data
  })
  var OMXS30 = await urllib.request('https://se.investing.com/indices/omx-stockholm-30').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(DowJones);
  var dow = soup.find('span', {'data-test': 'instrument-price-change-percent'}).text.trim()

  var soup = new JSSoup(OMXS30);
  var omx = soup.find('span', {'data-test': 'instrument-price-change-percent'}).text.trim()

  var market = [
    "Dow Jones: " + dow,
    "OMXS30: " + omx
  ]

  return market
}

async function getUFC(){
  var res = await urllib.request('https://www.tvmatchen.nu/fighting/').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})

  var ufc = []

  var i = 1
  for (var d of data){
      var time = d.find("div", {"class": "match-time"}).attrs['content']
      time = new Date(time).toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      var name = d.find("h3", {"itemprop": "name"}).text
      ufc.push({'time':time, 'name':name})
      if (i > 1)
          break
      i += 1
  }

  return ufc
}

async function getSpaceX(){
  var res = await urllib.request('https://spacecoastlaunches.com/launch-list/').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);

  var flight = {
      "name": "",
      "day": "",
      "time": "",
  }

  var data = soup.find("div", {"class": "three_fourth"})
  data = data.findAll("p")
  flight["day"] = data[0].text.trim()
  flight["name"] = data[1].text.trim()
  flight["time"] = data[4].text.trim()
  
  return flight
}

async function getF1(){
  var res = await urllib.request('https://www.tvmatchen.nu/motorsport/f1/').then(function (result) {
  return result.data
  })

   var soup = new JSSoup(res);
  var data = soup.findAll("div", {"itemtype": "http://schema.org/Event"})

  var f1 = []

  var i = 1
  for (var d of data){
      var time = d.find("div", {"class": "match-time"}).attrs['content']
      time = new Date(time).toLocaleDateString("sv-SE", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      var name = d.find("h3", {"itemprop": "name"}).text
      f1.push({'time':time, 'name':name})
      if (i > 1)
          break
      i += 1
  }
  return f1
}

async function getF1Standing(){
  var res = await urllib.request('https://www.skysports.com/f1/standings').then(function (result) {
  return result.data
  })

  var soup = new JSSoup(res);
  
  var f1 = []

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
  return f1
}


async function fixChar(data){
  for (const [key, value] of Object.entries(data)) {
    data[key] = data[key].replace('&#228;', "ä").replace('&#196;', "Ä").replace('&#229', "å").replace('&#197;', "Å").replace('&#246;', "ö").replace('&#214;', "Ö")
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