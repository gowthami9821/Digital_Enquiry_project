// Mock Railway Database for Digital Kiosk Demo

const trains = [
  {
    number: "12951",
    name: "Mumbai Rajdhani",
    nameHindi: "मुंबई राजधानी",
    from: "Mumbai Central",
    to: "New Delhi",
    scheduledArrival: "08:35",
    scheduledDeparture: "08:45",
    actualArrival: "08:52",
    actualDeparture: "09:02",
    platform: 3,
    status: "delayed",
    delay: 17,
    coaches: ["LOCO","H1","H2","A1","A2","B1","B2","B3","B4","S1","S2","S3","S4","S5","S6","GS","GS"],
    coachPositions: {
      "H1": 1, "H2": 2, "A1": 3, "A2": 4,
      "B1": 5, "B2": 6, "B3": 7, "B4": 8,
      "S1": 9, "S2": 10, "S3": 11, "S4": 12, "S5": 13, "S6": 14,
      "GS": 15
    }
  },
  {
    number: "12002",
    name: "Bhopal Shatabdi",
    nameHindi: "भोपाल शताब्दी",
    from: "New Delhi",
    to: "Habibganj",
    scheduledArrival: "10:00",
    scheduledDeparture: "06:00",
    actualArrival: "10:00",
    actualDeparture: "06:00",
    platform: 1,
    status: "on-time",
    delay: 0,
    coaches: ["LOCO","EC","CC","CC","CC","CC","CC","CC","CC","CC","CC","CC"],
    coachPositions: {
      "EC": 1, "CC": 2
    }
  },
  {
    number: "22691",
    name: "Rajdhani Express",
    nameHindi: "राजधानी एक्सप्रेस",
    from: "Bangalore",
    to: "New Delhi",
    scheduledArrival: "20:00",
    scheduledDeparture: "20:10",
    actualArrival: "21:30",
    actualDeparture: "21:40",
    platform: 5,
    status: "delayed",
    delay: 90,
    coaches: ["LOCO","H1","A1","A2","B1","B2","B3","B4","S1","S2","S3","S4","GS","GS"],
    coachPositions: {
      "H1": 1, "A1": 2, "A2": 3,
      "B1": 4, "B2": 5, "B3": 6, "B4": 7,
      "S1": 8, "S2": 9, "S3": 10, "S4": 11, "GS": 12
    }
  },
  {
    number: "12301",
    name: "Howrah Rajdhani",
    nameHindi: "हावड़ा राजधानी",
    from: "Howrah",
    to: "New Delhi",
    scheduledArrival: "09:55",
    scheduledDeparture: "10:05",
    actualArrival: "09:55",
    actualDeparture: "10:05",
    platform: 2,
    status: "on-time",
    delay: 0,
    coaches: ["LOCO","H1","H2","A1","A2","B1","B2","B3","S1","S2","S3","S4","S5","GS"],
    coachPositions: {}
  },
  {
    number: "19027",
    name: "Vivek Express",
    nameHindi: "विवेक एक्सप्रेस",
    from: "Dibrugarh",
    to: "Kanyakumari",
    scheduledArrival: "14:20",
    scheduledDeparture: "14:30",
    actualArrival: "15:05",
    actualDeparture: "15:15",
    platform: 6,
    status: "delayed",
    delay: 45,
    coaches: ["LOCO","SL","SL","SL","SL","SL","SL","GS","GS","GS"],
    coachPositions: {}
  },
  {
    number: "12563",
    name: "Bihar Sampark Kranti",
    nameHindi: "बिहार संपर्क क्रांति",
    from: "New Delhi",
    to: "Rajendranagar",
    scheduledArrival: "11:00",
    scheduledDeparture: "11:05",
    actualArrival: "11:00",
    actualDeparture: "11:05",
    platform: 4,
    status: "on-time",
    delay: 0,
    coaches: ["LOCO","A1","B1","B2","S1","S2","S3","S4","GS"],
    coachPositions: {}
  }
];

const platforms = [
  { id: 1, name: "Platform 1", crowdLevel: 45, trains: ["12002"], amenities: ["Waiting Room", "Water Cooler"] },
  { id: 2, name: "Platform 2", crowdLevel: 30, trains: ["12301"], amenities: ["Waiting Room", "Bookstall"] },
  { id: 3, name: "Platform 3", crowdLevel: 78, trains: ["12951"], amenities: ["Food Stall", "ATM", "Water Cooler"] },
  { id: 4, name: "Platform 4", crowdLevel: 20, trains: ["12563"], amenities: ["Waiting Room"] },
  { id: 5, name: "Platform 5", crowdLevel: 65, trains: ["22691"], amenities: ["Food Stall", "Pharmacy", "Water Cooler"] },
  { id: 6, name: "Platform 6", crowdLevel: 55, trains: ["19027"], amenities: ["Waiting Room", "Bookstall"] },
];

const stationMap = {
  facilities: [
    { id: "pf1", name: "Platform 1", nameHindi: "प्लेटफॉर्म 1", x: 15, y: 30, type: "platform" },
    { id: "pf2", name: "Platform 2", nameHindi: "प्लेटफॉर्म 2", x: 15, y: 42, type: "platform" },
    { id: "pf3", name: "Platform 3", nameHindi: "प्लेटफॉर्म 3", x: 15, y: 54, type: "platform" },
    { id: "pf4", name: "Platform 4", nameHindi: "प्लेटफॉर्म 4", x: 55, y: 30, type: "platform" },
    { id: "pf5", name: "Platform 5", nameHindi: "प्लेटफॉर्म 5", x: 55, y: 42, type: "platform" },
    { id: "pf6", name: "Platform 6", nameHindi: "प्लेटफॉर्म 6", x: 55, y: 54, type: "platform" },
    { id: "tc1", name: "Ticket Counter", nameHindi: "टिकट काउंटर", x: 15, y: 10, type: "ticket" },
    { id: "tc2", name: "UTS Counter", nameHindi: "यूटीएस काउंटर", x: 35, y: 10, type: "ticket" },
    { id: "wr1", name: "Waiting Hall", nameHindi: "प्रतीक्षा कक्ष", x: 55, y: 10, type: "waiting" },
    { id: "fo1", name: "Food Court", nameHindi: "फूड कोर्ट", x: 75, y: 30, type: "food" },
    { id: "fo2", name: "Platform Café", nameHindi: "प्लेटफॉर्म कैफे", x: 75, y: 50, type: "food" },
    { id: "ex1", name: "Main Exit", nameHindi: "मुख्य निकास", x: 35, y: 80, type: "exit" },
    { id: "ex2", name: "South Exit", nameHindi: "दक्षिण निकास", x: 75, y: 80, type: "exit" },
    { id: "atm1", name: "ATM", nameHindi: "एटीएम", x: 25, y: 70, type: "atm" },
    { id: "ph1", name: "Pharmacy", nameHindi: "फार्मेसी", x: 65, y: 70, type: "medical" },
    { id: "kiosk", name: "You Are Here", nameHindi: "आप यहाँ हैं", x: 48, y: 68, type: "kiosk" },
  ]
};

const faq = [
  { q: "Where is the cloak room?", a: "The cloak room is near Main Exit on ground floor, Platform side.", aHindi: "क्लोक रूम मुख्य प्रवेश द्वार के पास, प्लेटफॉर्म की तरफ है।" },
  { q: "Where is the waiting room?", a: "The waiting room is near Platform 1 and Platform 4.", aHindi: "प्रतीक्षा कक्ष प्लेटफॉर्म 1 और 4 के पास है।" },
  { q: "Where is the food?", a: "Food Court is available near Platform 5 and 6. A café is also near Platform 2.", aHindi: "खाना प्लेटफॉर्म 5 और 6 के पास उपलब्ध है।" },
];

module.exports = { trains, platforms, stationMap, faq };
