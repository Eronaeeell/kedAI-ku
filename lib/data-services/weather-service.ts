interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  date: string;
  forecast?: {
    day: string;
    temperature: number;
    condition: string;
  }[];
}

interface WeatherServiceConfig {
  apiKey: string;
  baseUrl: string;
}

export class WeatherService {
  private config: WeatherServiceConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://api.openweathermap.org/data/2.5'
    };
  }

  async getCurrentWeather(city: string, country: string = 'MY'): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/weather?q=${city},${country}&appid=${this.config.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        location: `${data.name}, ${data.sys.country}`,
        date: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getWeatherForecast(city: string, country: string = 'MY', days: number = 5): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/forecast?q=${city},${country}&appid=${this.config.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get current weather (first item in forecast)
      const current = data.list[0];
      const forecast = data.list
        .filter((item: any, index: number) => index % 8 === 0) // Daily forecasts (every 8th item = 24 hours)
        .slice(0, days)
        .map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString(),
          temperature: item.main.temp,
          condition: item.weather[0].main
        }));

      return {
        temperature: current.main.temp,
        humidity: current.main.humidity,
        condition: current.weather[0].main,
        location: `${data.city.name}, ${data.city.country}`,
        date: new Date().toISOString(),
        forecast
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  async getMalaysiaWeatherData(): Promise<WeatherData[]> {
    const malaysianCities = [
      'Kuala Lumpur',
      'Penang',
      'Johor Bahru',
      'Kuching',
      'Kota Kinabalu',
      'Ipoh',
      'Malacca',
      'Petaling Jaya'
    ];

    const weatherPromises = malaysianCities.map(city => 
      this.getCurrentWeather(city, 'MY').catch(error => {
        console.error(`Error fetching weather for ${city}:`, error);
        return null;
      })
    );

    const results = await Promise.all(weatherPromises);
    return results.filter((result): result is WeatherData => result !== null);
  }
}

// Alternative weather service using WeatherAPI
export class WeatherAPIService {
  private config: WeatherServiceConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'http://api.weatherapi.com/v1'
    };
  }

  async getCurrentWeather(city: string, country: string = 'Malaysia'): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/current.json?key=${this.config.apiKey}&q=${city},${country}`
      );
      
      if (!response.ok) {
        throw new Error(`WeatherAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        condition: data.current.condition.text,
        location: `${data.location.name}, ${data.location.country}`,
        date: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}
