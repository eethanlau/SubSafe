//MapBox Script
      mapboxgl.accessToken = mapToken;
      const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: station.geometry.coordinates, // starting position [lng, lat]
      zoom: 9, // starting zoom
      projection: 'globe' // display the map as a 3D globe
      });
      map.on('style.load', () => {
      map.setFog({}); // Set the default atmosphere style
      });

      map.addControl(new mapboxgl.NavigationControl());

      new mapboxgl.Marker()
        .setLngLat(station.geometry.coordinates)
        .addTo(map)