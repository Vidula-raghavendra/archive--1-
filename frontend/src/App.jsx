import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { CloudRain, Sprout, AlertTriangle, Droplets, Wallet, Mountain, CheckCircle, MapPin, Thermometer, Wind, Activity } from 'lucide-react';
import './App.css';

const API_URL = 'http://127.0.0.1:5000';

function App() {
    const [info, setInfo] = useState({ districts: [], seasons: [], crops: [] });
    const [formData, setFormData] = useState({
        district: '',
        season: '',
        crop: '',
        area: '',
        rainfall: '',
        budget: 'Medium',
        slope: 'Flat',
        sowing_date: '',
        lat: null,
        lon: null
    });
    const [prediction, setPrediction] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [advisory, setAdvisory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('predict'); // 'predict', 'recommend', 'health'

    useEffect(() => {
        axios.get(`${API_URL}/info`)
            .then(res => {
                setInfo(res.data);
                if (res.data.districts.length > 0) setFormData(prev => ({ ...prev, district: res.data.districts[0] }));
                if (res.data.seasons.length > 0) setFormData(prev => ({ ...prev, season: res.data.seasons[0] }));
                if (res.data.crops.length > 0) setFormData(prev => ({ ...prev, crop: res.data.crops[0] }));
            })
            .catch(err => console.error("Error fetching info:", err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }));
                    alert("Location detected successfully!");
                },
                (error) => {
                    console.error("Error detecting location:", error);
                    alert("Could not detect location. Please ensure GPS is enabled.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handlePredict = async () => {
        setLoading(true);
        try {
            const forecastRes = await axios.post(`${API_URL}/forecast`, { district: formData.district });
            setForecast(forecastRes.data.forecast);

            let rainfallVal = formData.rainfall;
            if (!rainfallVal && forecastRes.data.forecast.length > 0) {
                rainfallVal = forecastRes.data.forecast[0].rainfall;
            }

            const predictRes = await axios.post(`${API_URL}/predict`, {
                ...formData,
                rainfall: rainfallVal || 0
            });
            setPrediction(predictRes.data);
        } catch (err) {
            console.error("Error predicting:", err);
            alert("Failed to get prediction.");
        }
        setLoading(false);
    };

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/recommend`, {
                district: formData.district,
                area: formData.area,
                budget: formData.budget,
                slope: formData.slope
            });
            setRecommendations(res.data.recommendations);
        } catch (err) {
            console.error("Error recommending:", err);
            alert("Failed to get recommendations.");
        }
        setLoading(false);
    };

    const handleAdvisory = async () => {
        if (!formData.lat || !formData.lon) {
            alert("Please detect your location first.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/advisory`, {
                lat: formData.lat,
                lon: formData.lon,
                crop: formData.crop,
                sowing_date: formData.sowing_date
            });
            setAdvisory(res.data);
        } catch (err) {
            console.error("Error fetching advisory:", err);
            alert("Failed to get advisory.");
        }
        setLoading(false);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1><Sprout className="icon" /> Smart Agriculture System</h1>
                <p>AI-Powered Crop Production & Climate Risk Analysis for Meghalaya</p>
            </header>

            <div className="mode-switch">
                <button className={mode === 'predict' ? 'active' : ''} onClick={() => setMode('predict')}>Prediction</button>
                <button className={mode === 'recommend' ? 'active' : ''} onClick={() => setMode('recommend')}>Recommendation</button>
                <button className={mode === 'health' ? 'active' : ''} onClick={() => setMode('health')}>Crop Health</button>
            </div>

            <main className="main-content">
                <section className="input-section">
                    <h2>
                        {mode === 'predict' && 'Crop Configuration'}
                        {mode === 'recommend' && 'Farm Details'}
                        {mode === 'health' && 'Crop Status'}
                    </h2>

                    {mode === 'health' && (
                        <div className="location-box">
                            <button className="location-btn" onClick={detectLocation}>
                                <MapPin size={16} /> {formData.lat ? 'Location Detected' : 'Detect My Location'}
                            </button>
                            {formData.lat && <span className="location-coords">{formData.lat.toFixed(2)}, {formData.lon.toFixed(2)}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label>District</label>
                        <select name="district" value={formData.district} onChange={handleInputChange}>
                            {info.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {mode !== 'health' && (
                        <div className="form-group">
                            <label>Area (Hectares)</label>
                            <input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g. 500" />
                        </div>
                    )}

                    {mode === 'predict' && (
                        <>
                            <div className="form-group">
                                <label>Season</label>
                                <select name="season" value={formData.season} onChange={handleInputChange}>
                                    {info.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Crop</label>
                                <select name="crop" value={formData.crop} onChange={handleInputChange}>
                                    {info.crops.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Rainfall (mm) - <i>Optional</i></label>
                                <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} placeholder="Leave empty to use forecast" />
                            </div>
                            <button className="predict-btn" onClick={handlePredict} disabled={loading}>
                                {loading ? 'Analyzing...' : 'Analyze & Predict'}
                            </button>
                        </>
                    )}

                    {mode === 'recommend' && (
                        <>
                            <div className="form-group">
                                <label>Budget</label>
                                <select name="budget" value={formData.budget} onChange={handleInputChange}>
                                    <option value="Low">Low (&#8377;20k/Ha)</option>
                                    <option value="Medium">Medium (&#8377;50k/Ha)</option>
                                    <option value="High">High (Unlimited)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Land Slope</label>
                                <select name="slope" value={formData.slope} onChange={handleInputChange}>
                                    <option value="Flat">Flat (Plains)</option>
                                    <option value="Gentle">Gentle Slope</option>
                                    <option value="Steep">Steep (Hills)</option>
                                </select>
                            </div>
                            <button className="predict-btn" onClick={handleRecommend} disabled={loading}>
                                {loading ? 'Finding Best Crops...' : 'Get Recommendations'}
                            </button>
                        </>
                    )}

                    {mode === 'health' && (
                        <>
                            <div className="form-group">
                                <label>Sowed Crop</label>
                                <select name="crop" value={formData.crop} onChange={handleInputChange}>
                                    {info.crops.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sowing Date</label>
                                <input type="date" name="sowing_date" value={formData.sowing_date} onChange={handleInputChange} />
                            </div>
                            <button className="predict-btn" onClick={handleAdvisory} disabled={loading}>
                                {loading ? 'Checking Health...' : 'Check Crop Health'}
                            </button>
                        </>
                    )}
                </section>

                <section className="results-section">
                    {mode === 'predict' && prediction && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card prediction-card">
                            <h3><Sprout size={20} /> Production Forecast</h3>
                            <div className="stat-grid">
                                <div className="stat-item">
                                    <span className="label">Predicted Production</span>
                                    <span className="value">{prediction.production.toFixed(2)} <small>Tonnes</small></span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Estimated Yield</span>
                                    <span className="value">{prediction.yield.toFixed(2)} <small>Tonnes/Ha</small></span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Est. Cultivation Cost</span>
                                    <span className="value">&#8377;{prediction.estimated_cost.toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'recommend' && recommendations && (
                        <div className="recommendations-list">
                            {recommendations.map((rec, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="card recommendation-card">
                                    <div className="rec-header">
                                        <h3>{i + 1}. {rec.crop}</h3>
                                        <span className="score-badge">{rec.score} pts</span>
                                    </div>
                                    <p><strong>Est. Cost:</strong> &#8377;{rec.estimated_cost.toLocaleString()}</p>
                                    <ul className="rec-reasons">
                                        {rec.reason.map((r, j) => <li key={j}><CheckCircle size={14} /> {r}</li>)}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {mode === 'health' && advisory && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card advisory-card">
                            <h3><Activity size={20} /> Real-Time Crop Advisory</h3>

                            {advisory.crop_advice && (
                                <div className="alert-box info">
                                    <p><strong>Crop Insight:</strong> {advisory.crop_advice}</p>
                                </div>
                            )}

                            {advisory.alerts.length > 0 ? (
                                <div className="alerts-container">
                                    {advisory.alerts.map((alert, i) => (
                                        <div key={i} className="alert-box warning">
                                            <AlertTriangle size={16} /> {alert}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert-box success">
                                    <CheckCircle size={16} /> No immediate weather threats detected for the next 7 days.
                                </div>
                            )}

                            <div className="weather-grid">
                                {advisory.forecast.slice(0, 5).map((day, i) => (
                                    <div key={i} className="weather-day">
                                        <span className="date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <div className="weather-icon">
                                            {day.rain > 5 ? <CloudRain size={20} /> : <Thermometer size={20} />}
                                        </div>
                                        <span className="temp">{day.temp}°C</span>
                                        <span className="rain">{day.rain}mm</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {mode === 'predict' && forecast && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card forecast-card">
                            <h3><CloudRain size={20} /> 3-Month Climate Forecast</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={forecast}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#ccc" />
                                        <YAxis stroke="#ccc" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                        <Legend />
                                        <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="risk-indicators">
                                {forecast.map((f, i) => (
                                    <div key={i} className={`risk-badge ${f.erosion_risk.toLowerCase()}`}>
                                        <span>{f.month}</span>
                                        <span>Risk: {f.erosion_risk}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
