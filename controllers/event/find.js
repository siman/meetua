
var bikeEvents = [
  {
    title: "pokatushka v buche",
    description: "buche \n ludei 100500 \n brat' shlem",
    author: "Denis",
    startDate: "4 May 2012",
    address: "Voloska St, 29",
    latitude: 50.469150,
    longitude: 30.515990
  },
  {
    title: "poezdka v ad",
    description: "berite s soboi dushi",
    author: "Devil",
    startDate: "5 April 2044",
    address: "Raiduzhna St, 29",
    latitude:50.482503,
    longitude:30.588658
  }
];

var codeEvents = [
  {
    title: "nodeJs Hackathon",
    description: "startup hack",
    author: "Sergey",
    startDate: "3 June 2012",
    address: "Rusanovskaya Naberezhnaya, 12",
    latitude: 50.442070,
    longitude: 30.591990
  }
];

var hikingEvents = [
  {
    title: "Kyiv hiking 1",
    description: "walk through MAydan",
    author: "DIma Yarosh",
    startDate: "23 June 2012",
    address: "Radishcheva, 10/14",
    latitude: 50.450040,
    longitude: 30.410272
  },
  {
    title: "Kyiv hiking 2 ",
    description: "walk through MAydan",
    author: "DIma Yarosh",
    startDate: "24 June 2012",
    address: "Radishcheva, 12/16",
    latitude: 50.447991,
    longitude: 30.410133
  },
  {
    title: "Kyiv hiking 3",
    description: "walk through MAydan",
    author: "DIma Yarosh",
    startDate: "25 June 2012",
    address: "Vozdukhoflotskiy prospekt, 14/17",
    latitude: 50.439513,
    longitude: 30.477438
  }
];

var events = {
  bike: bikeEvents,
  running: [],
  workout: [],
  hiking: hikingEvents,
  photo: [],
  en: [],
  code: codeEvents
};

module.exports = function(req, res) {
  res.json(events[req.query.act]);
};