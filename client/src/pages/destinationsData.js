import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'

export const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* Ajoutez une entrée par lieu. La clé est le nom du lieu tel qu'écrit dans Destinations.jsx. */
const entries = [
  {
    name: 'Ambanja',
    region: 'The North',
    tagline: 'Cocoa valleys and the gateway to Nosy Be',
    image: Ambanja,
    intro: [
      'Ambanja sits in the green Sambirano valley, one of the island’s best-known cocoa-growing areas. Plantations, spice fields and river villages surround the town.',
      'Most travellers pass through on the way to Nosy Be, but a day or two here shows you the working countryside behind the beaches.',
    ],
    best: 'April to November',
    stay: '1 to 2 nights',
    getting: 'By road from Diego Suarez or by domestic flight and road via Nosy Be. Boats to Nosy Be leave from the nearby Ankify jetty.',
    todo: [
      { title: 'Visit a cocoa plantation', text: 'Follow the beans from tree to drying rack and taste fresh chocolate.', image: Ambanja },
      { title: 'Walk through spice fields', text: 'Meet growers of vanilla, pepper and ylang-ylang with a local guide.', image: Deux },
      { title: 'Browse the town market', text: 'Fruit, spices and crafts, best early in the morning.', image: Tana },
    ],
    visit: [
      {
        name: 'Sambirano valley', text: 'Rolling plantations and river views, ideal by car or bike.', image: Ambanja,
        details: ['The Sambirano valley is the green heart of the region, with cocoa, coffee and spice farms along the river.', 'Drive or cycle the back roads, stop in villages and ask growers to show you how each crop is harvested.'],
        does: ['Cycle between plantations', 'Stop at roadside stalls', 'Meet growers in the villages'],
        duration: 'Half day to 1 day', groupSize: 'Up to 8 guests', tourType: 'Countryside tour', price: 85, rating: '4.9', reviews: 48,
        overview: [
          'The Sambirano valley is the green heart of the Ambanja region. Cocoa, coffee, vanilla and ylang-ylang grow side by side along the river, and the valley has long been known for its fine cocoa.',
          'Your day follows quiet back roads between plantations and villages. You stop where something is happening: beans drying in the sun, a family harvesting pods, a stall selling fruit.',
          'A local guide travels with you, translates, and introduces you to the growers, so you leave with real conversations and not only photos.',
        ],
        highlights: ['Follow cocoa from tree to drying rack', 'Taste fresh chocolate and local vanilla', 'Cycle or drive through river villages', 'Meet growers and their families', 'Stop at roadside fruit and spice stalls'],
        included: ['Local guide', 'Private vehicle or bicycles', 'Plantation visits', 'Tastings', 'Bottled water'],
        excluded: ['Lunch', 'Personal purchases', 'Tips'],
      },
      {
        name: 'Manongarivo reserve', text: 'A protected forest for hikers who want wildlife and quiet.', image: NosyLonjo,
        details: ['Manongarivo is a protected forest reserve in the mountains behind Ambanja, rich in plants and wildlife.', 'Access takes planning, so we arrange guides and permits before your visit.'],
        does: ['Hike with a local guide', 'Look for lemurs and birds', 'Camp near the reserve'],
        duration: '1 to 2 days', groupSize: 'Up to 6 guests', tourType: 'Nature hike', price: 140, rating: '4.8', reviews: 21,
        overview: [
          'Manongarivo is a protected forest reserve in the mountains behind Ambanja, home to a wide range of plants, birds and lemurs.',
          'Trails are rough and access takes planning, so this visit suits walkers who enjoy quiet and are comfortable with basic conditions.',
          'We arrange the guide, permits and transport in advance, and adapt the route to the season and the group.',
        ],
        highlights: ['Walk forest trails with a trained guide', 'Look for lemurs, chameleons and birds', 'Spot endemic plants along the path', 'Optional camping near the reserve', 'Small groups for a quiet experience'],
        included: ['Guide and park permits', 'Transport from Ambanja', 'Trail snacks', 'Bottled water'],
        excluded: ['Camping equipment', 'Meals on overnight trips', 'Tips'],
      },
      {
        name: 'Ankify jetty', text: 'The departure point for boats to Nosy Be.', image: NosyIranja,
        details: ['Ankify is the small port where boats leave for Nosy Be, about an hour’s drive from Ambanja.', 'The crossing takes around an hour by speedboat, and schedules depend on tides and weather.'],
        does: ['Take the boat to Nosy Be', 'Have lunch by the water', 'Arrange a private transfer'],
        duration: '2 to 3 hours', groupSize: 'Up to 12 guests', tourType: 'Transfer and stop', price: 45, rating: '4.7', reviews: 64,
        overview: [
          'Ankify is the small port where boats leave for Nosy Be. It sits about an hour by road from Ambanja, on a calm stretch of coast.',
          'The crossing takes around an hour by speedboat. Times depend on tides and weather, so we confirm schedules the day before.',
          'Arrive early to enjoy a meal by the water, then cross to Nosy Be with your luggage handled by our team.',
        ],
        highlights: ['Scenic drive from Ambanja to the coast', 'Speedboat crossing to Nosy Be', 'Lunch by the water before departure', 'Luggage handled by our team', 'Private transfer available on request'],
        included: ['Road transfer from Ambanja', 'Boat ticket', 'Luggage handling'],
        excluded: ['Lunch', 'Tips', 'Hotel on arrival'],
      },
    ],
    tip: 'Ask us to arrange a plantation visit in advance, as harvest and drying seasons change what you can see.',
  },
  {
    name: 'Ramena Beach',
    region: 'The North',
    tagline: 'Sailing, kitesurfing and the Emerald Sea',
    image: Ramena,
    intro: [
      'Ramena is a small fishing village on the bay of Diego Suarez, known for calm turquoise water and steady winds.',
      'It is an easy day trip from town, or a relaxed base for a few days of sailing and watersports.',
    ],
    best: 'April to November',
    stay: '2 to 3 nights',
    getting: 'About 30 minutes by road from Diego Suarez. Taxis and private drivers make the trip daily.',
    todo: [
      { title: 'Sail across the bay', text: 'Half-day and full-day boat trips with swimming stops.', image: Ramena },
      { title: 'Try kitesurfing', text: 'Lessons and rentals for all levels on the nearby beaches.', image: NosyIranja },
      { title: 'Eat fresh seafood', text: 'Simple beach restaurants serve the morning catch.', image: NosyLonjo },
    ],
    visit: [
      { name: 'Emerald Sea', text: 'Shallow, bright water, best reached by boat.', image: Ramena },
      { name: 'Sugar Loaf', text: 'The iconic rock rising from Diego Bay.', image: NosyLonjo },
      { name: 'Dunes Bay', text: 'Wind and white sand for kitesurfers.', image: Deux },
    ],
    tip: 'Winds are strongest in the afternoon, so plan boat trips for the morning.',
  },
  {
    name: 'Nosy Iranja',
    region: 'The North',
    tagline: 'Two islands, one white sandbar',
    image: NosyIranja,
    intro: [
      'Nosy Iranja is a pair of small islands joined by a long sandbar that appears at low tide. Sea turtles nest on its beaches.',
      'It is reached by boat from Nosy Be, usually as a full-day trip or an overnight stay.',
    ],
    best: 'April to November',
    stay: '1 day or 1 night',
    getting: 'By speedboat or sailboat from Nosy Be, roughly two hours depending on the sea.',
    todo: [
      { title: 'Walk the sandbar', text: 'Cross between the two islands at low tide.', image: NosyIranja },
      { title: 'Snorkel with turtles', text: 'Calm, clear water close to the beach.', image: Ramena },
      { title: 'Climb to the lighthouse', text: 'A short walk for views over the whole area.', image: NosyLonjo },
    ],
    visit: [
      { name: 'The sandbar', text: 'The signature view of the island.', image: NosyIranja },
      { name: 'Turtle beach', text: 'A protected nesting area, visit with respect.', image: Ramena },
      { name: 'Nosy Lonjo', text: 'A quiet neighbouring island, often combined in one trip.', image: NosyLonjo },
    ],
    tip: 'Check tide times before you go, since the sandbar is only visible at low tide.',
  },
  {
    name: 'Antananarivo',
    region: 'The Highlands',
    tagline: 'A hillside capital full of markets and history',
    image: Tana,
    intro: [
      'Antananarivo climbs a series of hills, with narrow streets, old palaces and busy markets.',
      'Most journeys start here, so plan a day or two to acclimatise and explore.',
    ],
    best: 'May to October',
    stay: '1 to 2 nights',
    getting: 'International flights arrive at Ivato airport, about 30 minutes from the centre.',
    todo: [
      { title: 'Explore the old town', text: 'Walk the steep lanes of the upper city.', image: Tana },
      { title: 'Shop at Analakely market', text: 'Crafts, fabrics and street food.', image: Ambanja },
      { title: 'Visit the Rova', text: 'The former royal palace above the city.', image: Deux },
    ],
    visit: [
      { name: 'The Rova', text: 'A hilltop royal compound with wide views.', image: Deux },
      { name: 'Lake Anosy', text: 'A calm spot in the city centre.', image: Tana },
      { name: 'Ambohimanga', text: 'A sacred royal hill a short drive north.', image: Ambanja },
    ],
    tip: 'Traffic is heavy, so allow extra time for airport transfers.',
  },
  {
    name: 'Baobab Avenue',
    region: 'The West',
    tagline: 'Giant baobabs glowing at sunset',
    image: Deux,
    intro: [
      'Near Morondava, a dirt road runs between tall baobab trees, some hundreds of years old.',
      'It is one of the most photographed places in Madagascar, and it is best at sunrise and sunset.',
    ],
    best: 'May to October',
    stay: '1 to 2 nights',
    getting: 'By road or domestic flight to Morondava, then a short drive of about 45 minutes.',
    todo: [
      { title: 'Watch the sunset', text: 'The light turns the trunks orange and red.', image: Deux },
      { title: 'Meet local villagers', text: 'Visit nearby hamlets with a guide.', image: Ambanja },
      { title: 'Photograph at dawn', text: 'Fewer visitors and softer light.', image: Tana },
    ],
    visit: [
      { name: 'The main avenue', text: 'The famous line of tall trees.', image: Deux },
      { name: 'Twin baobabs', text: 'Two trunks twisted around each other.', image: NosyLonjo },
      { name: 'Morondava coast', text: 'A relaxed beach town nearby.', image: Ramena },
    ],
    tip: 'Arrive an hour before sunset to walk the avenue before the crowds.',
  },
  {
    name: 'Andasibe',
    region: 'The East',
    tagline: 'Indri calls in the rainforest',
    image: Ambanja,
    intro: [
      'Andasibe is a rainforest reserve known for the indri, the largest living lemur, whose calls carry across the forest.',
      'It is close enough to the capital for a weekend, and better with a night walk.',
    ],
    best: 'September to December',
    stay: '1 to 2 nights',
    getting: 'About three to four hours by road from Antananarivo.',
    todo: [
      { title: 'Track the indri', text: 'A guided morning walk to find a family group.', image: Ambanja },
      { title: 'Take a night walk', text: 'Spot small nocturnal lemurs and chameleons.', image: Tana },
      { title: 'Visit a lemur island', text: 'Meet rescued lemurs in a sheltered setting.', image: Deux },
    ],
    visit: [
      { name: 'Andasibe-Mantadia', text: 'The main national park and its forest trails.', image: Ambanja },
      { name: 'Lemur island', text: 'A short boat ride to close encounters.', image: NosyLonjo },
      { name: 'Forest viewpoints', text: 'Short hikes with open views.', image: Tana },
    ],
    tip: 'Bring a light rain jacket, since the forest is humid all year.',
  },
]

export const destinations = Object.fromEntries(entries.map((e) => [slugify(e.name), { ...e, slug: slugify(e.name), visit: e.visit.map((v) => ({ ...v, slug: slugify(v.name) })) }]))