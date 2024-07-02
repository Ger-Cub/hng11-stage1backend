import express from 'express';
import { configDotenv } from 'dotenv';

configDotenv();

import ip from 'ip'; // To get client IP address

const app = express();
const port = process.env.PORT || 3000;

async function getLocationFromIP(ipAddress) {
  // URL de l'API pour obtenir les informations de localisation
  const apiUrl = `https://ipapi.co/${ipAddress}/json/`;

  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Récupérer les informations de localisation
      const city = data.city;

      // Retourner un objet avec les informations
      return {
        city: city
      };
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des informations de localisation :", error);
      return null;
    });
}

// import fetch from 'node-fetch';

// Votre clé API OpenWeather
const API_KEY = process.env.API_KEY;

async function getTemperatureByCity(cityName) {
  try {
    // URL de l'API OpenWeather pour récupérer les données météorologiques d'une ville
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      const temperature = data.main.temp;
      return temperature;
    } else {
      throw new Error(`Error ${response.status}: ${data.message}`);
    }
  } catch (error) {
    console.error('Error getting temperature:', error);
    throw error;
  }
}



app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name; // Get visitor name from query parameter
  // const clientIP = ip.address(); // Get client IP address

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const clientIP = ip.replace(/^::ffff:/, "");

  const clientCity = await getLocationFromIP(clientIP);

  try {
    

      const location = clientCity.city || 'Goma';
  
      const temperature = await getTemperatureByCity(location); 
  
      const response = {
        client_ip: clientIP,
        location: location,
        greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${location}`,
      };
      res.status(200).json(response); // Send JSON response
    
  } catch (error) {
    res.status(500).json({message : 'Error getting temperature or client IP'}); // Send JSON response

  }

});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
