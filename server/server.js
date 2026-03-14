const express = require('express');
const cors = require('cors');
const { trains, platforms, stationMap, faq } = require('./railways');

const app = express();
app.use(cors());
app.use(express.json());

// GET all trains
app.get('/api/trains', (req, res) => {
  res.json(trains);
});

// GET train by number
app.get('/api/trains/:number', (req, res) => {
  const train = trains.find(t => t.number === req.params.number);
  if (!train) return res.status(404).json({ error: 'Train not found', errorHindi: 'ट्रेन नहीं मिली' });
  res.json(train);
});

// GET platforms with crowd data
app.get('/api/platforms', (req, res) => {
  // Simulate live crowd fluctuation
  const liveData = platforms.map(p => ({
    ...p,
    crowdLevel: Math.max(10, Math.min(99, p.crowdLevel + Math.floor((Math.random() - 0.5) * 10)))
  }));
  res.json(liveData);
});

// GET station map
app.get('/api/station-map', (req, res) => {
  res.json(stationMap);
});

// GET coach positions for a train
app.get('/api/trains/:number/coaches', (req, res) => {
  const train = trains.find(t => t.number === req.params.number);
  if (!train) return res.status(404).json({ error: 'Train not found' });
  res.json({ trainNumber: train.number, trainName: train.name, coaches: train.coaches, platform: train.platform });
});

// POST intent detection (voice query processing)
app.post('/api/intent', (req, res) => {
  const { text, lang = 'en' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const lower = text.toLowerCase();

  // Intent: Train Status
  const trainNumberMatch = lower.match(/\b(1[0-9]{4})\b/);
  if (trainNumberMatch) {
    const num = trainNumberMatch[1];
    const train = trains.find(t => t.number === num);
    if (train) {
      const delayText = train.delay > 0 ? ` It is running ${train.delay} minutes late.` : ' It is running on time.';
      const delayHindi = train.delay > 0 ? ` यह ${train.delay} मिनट देरी से चल रही है।` : ' यह समय पर चल रही है।';
      return res.json({
        intent: 'train_status',
        train,
        response: lang === 'hi'
          ? `ट्रेन ${train.number} ${train.nameHindi} प्लेटफॉर्म ${train.platform} पर है।${delayHindi}`
          : `Train ${train.number} ${train.name} is on Platform ${train.platform}.${delayText}`,
        highlight: 'train_status'
      });
    } else {
      return res.json({
        intent: 'train_not_found',
        response: lang === 'hi'
          ? `ट्रेन ${num} की जानकारी उपलब्ध नहीं है।`
          : `Train ${num} information is not available.`,
        highlight: null
      });
    }
  }

  // Intent: Platform location
  const platformMatch = lower.match(/platform\s*(\d+)|प्लेटफॉर्म\s*(\d+)/);
  if (platformMatch) {
    const pNum = platformMatch[1] || platformMatch[2];
    const pf = platforms.find(p => p.id === parseInt(pNum));
    if (pf) {
      const trainsOnPf = trains.filter(t => t.platform === parseInt(pNum));
      const trainNames = trainsOnPf.map(t => `${t.name} (${t.number})`).join(', ');
      return res.json({
        intent: 'platform_location',
        platform: pf,
        response: lang === 'hi'
          ? `प्लेटफॉर्म ${pNum} मध्य भाग में है। वर्तमान में: ${trainNames || 'कोई ट्रेन नहीं'}`
          : `Platform ${pNum} is in the ${parseInt(pNum) <= 3 ? 'left' : 'right'} section. Current trains: ${trainNames || 'None'}`,
        highlight: 'map'
      });
    }
  }

  // Intent: Crowd / congestion
  if (lower.includes('crowd') || lower.includes('congestion') || lower.includes('भीड़')) {
    const mostCrowded = [...platforms].sort((a, b) => b.crowdLevel - a.crowdLevel)[0];
    return res.json({
      intent: 'crowd_info',
      response: lang === 'hi'
        ? `प्लेटफॉर्म ${mostCrowded.id} पर सबसे अधिक भीड़ है (${mostCrowded.crowdLevel}%)।`
        : `Platform ${mostCrowded.id} is most crowded right now (${mostCrowded.crowdLevel}% capacity).`,
      highlight: 'crowd'
    });
  }

  // Intent: Food / facilities
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('खाना')) {
    return res.json({
      intent: 'facility',
      response: lang === 'hi'
        ? 'फूड कोर्ट प्लेटफॉर्म 5-6 के पास है। प्लेटफॉर्म 2 पर कैफे भी है।'
        : 'Food Court is near platforms 5-6. A café is also available near Platform 2.',
      highlight: 'map'
    });
  }

  // Intent: Ticket counter
  if (lower.includes('ticket') || lower.includes('counter') || lower.includes('टिकट')) {
    return res.json({
      intent: 'facility',
      response: lang === 'hi'
        ? 'टिकट काउंटर मुख्य प्रवेश द्वार के पास है। UTS काउंटर भी उपलब्ध है।'
        : 'Ticket counters are near the main entrance. UTS counter is also available.',
      highlight: 'map'
    });
  }

  // Intent: Waiting room
  if (lower.includes('wait') || lower.includes('rest') || lower.includes('प्रतीक्षा')) {
    return res.json({
      intent: 'facility',
      response: lang === 'hi'
        ? 'प्रतीक्षा कक्ष प्लेटफॉर्म 1, 2 और 4 के पास उपलब्ध है।'
        : 'Waiting rooms are available near Platforms 1, 2, and 4.',
      highlight: 'map'
    });
  }

  // Default / fallback
  return res.json({
    intent: 'unknown',
    response: lang === 'hi'
      ? 'मैं आपकी बात समझ नहीं पाया। कृपया ट्रेन नंबर या सुविधा का नाम पूछें।'
      : 'I could not understand your query. Please ask about a train number, platform, or station facility.',
    highlight: null
  });
});

// GET FAQ
app.get('/api/faq', (req, res) => res.json(faq));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚂 Railway Kiosk API running on port ${PORT}`));

module.exports = app;
