// src/utils/agriLogic.js

// Mock data for Meghalaya districts slope approximation
const DISTRICT_SLOPES = {
    "East Khasi Hills": "Steep",
    "West Khasi Hills": "Steep",
    "Jaintia Hills": "Steep",
    "Ri Bhoi": "Gentle",
    "West Garo Hills": "Gentle",
    "East Garo Hills": "Steep",
    "South Garo Hills": "Steep",
    "South West Khasi Hills": "Steep"
};

export const getSlopeFromDistrict = (district) => {
    return DISTRICT_SLOPES[district] || "Gentle"; // Default to Gentle if unknown
};

export const calculateErosionRisk = (slope, rainfall) => {
    // Simple rule-based logic
    if (slope === "Steep") {
        if (rainfall > 200) return { risk: "High", percentage: 85, color: "#ef4444" };
        if (rainfall > 100) return { risk: "Moderate", percentage: 60, color: "#f59e0b" };
        return { risk: "Low", percentage: 30, color: "#10b981" };
    } else if (slope === "Gentle") {
        if (rainfall > 250) return { risk: "Moderate", percentage: 50, color: "#f59e0b" };
        return { risk: "Low", percentage: 20, color: "#10b981" };
    } else { // Flat
        if (rainfall > 300) return { risk: "Low", percentage: 15, color: "#10b981" };
        return { risk: "Minimal", percentage: 5, color: "#10b981" };
    }
};

export const generateAIAdvice = (crop, district, sowingDate) => {
    // Simulated AI response
    const crops = {
        "Rice": {
            fertilizer: "Apply NPK 40:20:20 at basal, tillering, and panicle initiation stages.",
            bestTime: "June - July",
            revenue: "₹60,000 - ₹80,000 per hectare"
        },
        "Maize": {
            fertilizer: "Apply FYM 10t/ha + NPK 60:40:40.",
            bestTime: "March - April",
            revenue: "₹45,000 - ₹55,000 per hectare"
        },
        "Potato": {
            fertilizer: "Apply NPK 120:80:80 split doses.",
            bestTime: "February or September",
            revenue: "₹1,20,000 - ₹1,50,000 per hectare"
        }
    };

    const defaultAdvice = {
        fertilizer: "Use organic compost and balanced NPK fertilizers based on soil tests.",
        bestTime: "Monsoon season",
        revenue: "Varies based on market rates"
    };

    const advice = crops[crop] || defaultAdvice;

    return {
        ...advice,
        soilHealth: "Maintain soil organic matter > 2% for sustainable yields.",
        waterMgmt: "Ensure proper drainage to prevent waterlogging in heavy rains."
    };
};

export const fetchWeatherForecast = async (lat, lon) => {
    try {
        // Open-Meteo API for 14 days (Added relative_humidity_2m_max)
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto&forecast_days=14`);
        const data = await response.json();

        const daily = data.daily;
        const forecast = daily.time.map((date, i) => ({
            date,
            temp: daily.temperature_2m_max[i],
            rain: daily.precipitation_sum[i],
            wind: daily.wind_speed_10m_max[i],
            humidity: daily.relative_humidity_2m_max ? daily.relative_humidity_2m_max[i] : 70 // Fallback
        }));

        // Mock remaining 16 days to simulate 1 month
        const lastDate = new Date(daily.time[daily.time.length - 1]);
        for (let i = 1; i <= 16; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i);
            forecast.push({
                date: nextDate.toISOString().split('T')[0],
                temp: Math.round(20 + Math.random() * 5),
                rain: Math.round(Math.random() * 10),
                wind: Math.round(5 + Math.random() * 10),
                humidity: Math.round(60 + Math.random() * 30) // Random humidity 60-90%
            });
        }

        return forecast;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return [];
    }
};
