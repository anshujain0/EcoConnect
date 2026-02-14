const axios = require('axios');

class LocationService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.useRealApi = true; 
  }

  async findNearbyLocations(latitude, longitude, category, radius = 5000) {
    console.log(`Finding locations near: ${latitude}, ${longitude} for category: ${category}`);

    try {
      const results = await this.findWithOverpassAPI(latitude, longitude, category, radius);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} real locations via OpenStreetMap`);
        return results;
      } else {
        console.log('No real locations found, using mock data');
        return this.getMockLocations(latitude, longitude, category);
      }
    } catch (error) {
      console.error('OpenStreetMap API failed, using mock data:', error.message);
      return this.getMockLocations(latitude, longitude, category);
    }
  }

  async findWithOverpassAPI(lat, lng, category, radius) {
    const searchTags = this.getCategoryOsmTags(category);
    
    const queries = searchTags.map(tag => `
      node${tag}(around:${radius},${lat},${lng});
      way${tag}(around:${radius},${lat},${lng});
    `).join('');

    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${queries}
      );
      out body center;
    `;

    console.log('Querying OpenStreetMap Overpass API...');

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      }
    );

    if (!response.data || !response.data.elements) {
      return [];
    }

    const results = response.data.elements
      .filter(el => el.tags && el.tags.name)
      .map(el => {
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        
        return {
          name: el.tags.name,
          type: this.determineLocationType(el.tags),
          address: this.buildAddress(el.tags),
          distance: this.calculateDistance(lat, lng, elLat, elLng),
          lat: elLat,
          lng: elLng,
          phone: el.tags.phone || el.tags['contact:phone'] || 'Not available',
          isOpen: true,
          website: el.tags.website || el.tags['contact:website'] || null
        };
      })
      .filter(loc => loc.lat && loc.lng)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);

    return results;
  }

  getCategoryOsmTags(category) {
    const tagMap = {
      ewaste: [
        '["amenity"="recycling"]["recycling:electronics"="yes"]',
        '["amenity"="recycling"]["recycling:computers"="yes"]',
        '["shop"="computer"]',
        '["amenity"="recycling"]'
      ],
      plastic: [
        '["amenity"="recycling"]["recycling:plastic"="yes"]',
        '["amenity"="recycling"]["recycling:plastic_bottles"="yes"]',
        '["amenity"="recycling"]'
      ],
      metal: [
        '["amenity"="recycling"]["recycling:scrap_metal"="yes"]',
        '["amenity"="recycling"]["recycling:metal"="yes"]',
        '["shop"="scrap_yard"]',
        '["amenity"="recycling"]'
      ],
      fabric: [
        '["amenity"="recycling"]["recycling:clothes"="yes"]',
        '["amenity"="charity"]',
        '["shop"="charity"]',
        '["amenity"="recycling"]["recycling:textiles"="yes"]'
      ],
      glass: [
        '["amenity"="recycling"]["recycling:glass"="yes"]',
        '["amenity"="recycling"]["recycling:glass_bottles"="yes"]',
        '["amenity"="recycling"]'
      ],
      paper: [
        '["amenity"="recycling"]["recycling:paper"="yes"]',
        '["amenity"="recycling"]["recycling:cardboard"="yes"]',
        '["amenity"="recycling"]'
      ],
      organic: [
        '["amenity"="recycling"]["recycling:organic"="yes"]',
        '["amenity"="recycling"]["recycling:green_waste"="yes"]'
      ],
      hazardous: [
        '["amenity"="recycling"]["recycling:hazardous_waste"="yes"]',
        '["amenity"="waste_disposal"]'
      ],
      default: [
        '["amenity"="recycling"]',
        '["amenity"="waste_disposal"]'
      ]
    };

    return tagMap[category] || tagMap.default;
  }

  determineLocationType(tags) {
    if (tags.shop === 'charity' || tags.amenity === 'charity') return 'NGO / Charity';
    if (tags.recycling?.clothes === 'yes' || tags.recycling?.textiles === 'yes') return 'Textile Recycler';
    if (tags.recycling?.electronics === 'yes' || tags.recycling?.computers === 'yes') return 'E-waste Recycler';
    if (tags.recycling?.scrap_metal === 'yes' || tags.shop === 'scrap_yard') return 'Scrap Dealer';
    if (tags.amenity === 'recycling') return 'Recycling Center';
    if (tags.amenity === 'waste_disposal') return 'Waste Management';
    return 'Recycling Center';
  }

  buildAddress(tags) {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  getMockLocations(lat, lng, category) {
    console.log('Using mock location data for category:', category);
    
    const baseLocations = {
      ewaste: [
        { name: 'E-Waste Collection Center', type: 'E-waste Recycler', baseDistance: 2.5 },
        { name: 'Tech Recycle India', type: 'E-waste Recycler', baseDistance: 4.2 },
        { name: 'Green Electronics Disposal', type: 'E-waste Recycler', baseDistance: 6.8 },
        { name: 'Digital Waste Management', type: 'E-waste Recycler', baseDistance: 8.1 },
        { name: 'Eco Tech Recyclers', type: 'E-waste Recycler', baseDistance: 10.5 }
      ],
      plastic: [
        { name: 'Plastic Recycling Hub', type: 'Recycling Center', baseDistance: 1.8 },
        { name: 'Green Plastic Solutions', type: 'Recycling Center', baseDistance: 3.5 },
        { name: 'EcoPlast Recyclers', type: 'Recycling Center', baseDistance: 5.2 },
        { name: 'Municipal Waste Center', type: 'Waste Management', baseDistance: 7.0 },
        { name: 'Clean City Recyclers', type: 'Recycling Center', baseDistance: 9.3 }
      ],
      metal: [
        { name: 'Shri Ram Scrap Dealers', type: 'Scrap Dealer', baseDistance: 1.2 },
        { name: 'Metal Recycling Co.', type: 'Scrap Dealer', baseDistance: 3.0 },
        { name: 'Iron & Steel Scrap', type: 'Scrap Dealer', baseDistance: 4.5 },
        { name: 'Universal Scrap Traders', type: 'Scrap Dealer', baseDistance: 6.8 },
        { name: 'Metro Metal Recyclers', type: 'Scrap Dealer', baseDistance: 8.9 }
      ],
      fabric: [
        { name: 'Cloth Bank NGO', type: 'NGO', baseDistance: 2.0 },
        { name: 'Goonj - Clothing Donation', type: 'NGO', baseDistance: 4.3 },
        { name: 'Textile Recycling Center', type: 'Recycling Center', baseDistance: 5.8 },
        { name: 'Helping Hands Foundation', type: 'NGO', baseDistance: 7.2 },
        { name: 'Second Life Textiles', type: 'Recycling Center', baseDistance: 9.5 }
      ],
      glass: [
        { name: 'Glass Recycling Plant', type: 'Recycling Center', baseDistance: 3.2 },
        { name: 'City Waste Management', type: 'Waste Management', baseDistance: 5.0 },
        { name: 'Green Glass Recyclers', type: 'Recycling Center', baseDistance: 7.4 },
        { name: 'Municipal Collection Point', type: 'Waste Management', baseDistance: 8.8 },
        { name: 'Eco Glass Solutions', type: 'Recycling Center', baseDistance: 11.2 }
      ],
      paper: [
        { name: 'Paper Recycling Hub', type: 'Scrap Dealer', baseDistance: 1.5 },
        { name: 'Raddi Wala Paper Scrap', type: 'Scrap Dealer', baseDistance: 2.8 },
        { name: 'Book Donation Center', type: 'NGO', baseDistance: 4.6 },
        { name: 'Cardboard Recyclers', type: 'Recycling Center', baseDistance: 6.3 },
        { name: 'Waste Paper Collection', type: 'Scrap Dealer', baseDistance: 8.7 }
      ],
      default: [
        { name: 'City Recycling Center', type: 'Recycling Center', baseDistance: 2.5 },
        { name: 'Municipal Waste Facility', type: 'Waste Management', baseDistance: 4.0 },
        { name: 'Green Earth NGO', type: 'NGO', baseDistance: 6.5 },
        { name: 'Eco Solutions Hub', type: 'Recycling Center', baseDistance: 8.0 },
        { name: 'Waste Management Authority', type: 'Waste Management', baseDistance: 10.0 }
      ]
    };

    const locations = baseLocations[category] || baseLocations.default;

    return locations.map((loc, index) => ({
      name: loc.name,
      type: loc.type,
      address: this.generateMockAddress(lat, lng, index),
      distance: loc.baseDistance,
      lat: parseFloat((lat + (Math.random() - 0.5) * 0.1).toFixed(6)),
      lng: parseFloat((lng + (Math.random() - 0.5) * 0.1).toFixed(6)),
      phone: this.generateMockPhone(),
      isOpen: Math.random() > 0.3
    }));
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  generateMockAddress(lat, lng, index) {
    const areas = ['MG Road', 'Park Street', 'Gandhi Nagar', 'Residency Road',
                   'Nehru Place', 'Sector 15', 'Industrial Area', 'Market Road'];
    return `${index + 1}, ${areas[index % areas.length]}, Indore, Madhya Pradesh`;
  }

  generateMockPhone() {
    return `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`;
  }

  async updateAnalysisWithLocations(analysisId, latitude, longitude) {
    const Analysis = require('../models/Analysis');
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) throw new Error('Analysis not found');

    console.log('Finding locations for category:', analysis.category);

    const locations = await this.findNearbyLocations(
      latitude,
      longitude,
      analysis.category
    );

    analysis.nearbyLocations = locations;
    await analysis.save();

    console.log(`Saved ${locations.length} locations to analysis`);
    return locations;
  }
}

module.exports = new LocationService();