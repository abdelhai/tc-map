function sanitizeHTML(strings) {
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  let result = strings[0];
  for (let i = 1; i < arguments.length; i++) {
    result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
      return entities[char];
    });
    result += strings[i];
  }
  return result;
}

function setapoid(id) {
  window.APO_ID = id;
  console.log(window.APO_ID)
}

function initMap() {

  // Create the map.
  const map = new google.maps.Map(document.getElementsByClassName('map')[0], {
    zoom: 14,
    center: { lat: 48.1351, lng: 11.5820 },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });


  // Load the stores GeoJSON onto the map.
  map.data.loadGeoJson('stores.json');

  // Define the custom marker icons, using the store's "category".
  map.data.setStyle(feature => {
    return {
      icon: {
        url: `img/icon_${feature.getProperty('category')}.png`,
        scaledSize: new google.maps.Size(34, 49)
      }
    };
  });
  console.log(map.data)

  const apiKey = 'AIzaSyALb9lFprUdP6ot-Wc-U1QCWvX3PXNgLu0';
  const infoWindow = new google.maps.InfoWindow();
  infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

  // Show the information for a store when its marker is clicked.
  map.data.addListener('click', event => {
    const category = event.feature.getProperty('category');
    const name = event.feature.getProperty('name');
    const description = event.feature.getProperty('description');
    const hours = event.feature.getProperty('hours');
    const phone = event.feature.getProperty('phone');
    const position = event.feature.getGeometry().get();
    const id = event.feature.getProperty('id');

    const content = sanitizeHTML`
        <h2>${name}</h2><p>${description}</p>
        <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
        <p>
        <a href="#" class="cta-btn" onclick="setapoid(${id})" >Abholen</a>
        <a href="#" class="cta-btn" onclick="setapoid(${id})" >Liefern lassen</a>
        </p>
    `;

    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    map.setCenter(position);
    infoWindow.open(map);
  });

}
