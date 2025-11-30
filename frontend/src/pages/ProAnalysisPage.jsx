import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp, Sprout, Bug, Calendar, ArrowLeft,
    DollarSign, Droplets, Sun, Wind, Award, CheckCircle
} from 'lucide-react';
import { translations } from '../utils/translations';
import '../App.css';

const ProAnalysisPage = ({ language, setLanguage }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prediction, erosionRisk, longForecast, aiAdvice, recommendation, formData } = location.state || {};
    const t = translations[language] || translations['en'];

    useEffect(() => {
        if (!location.state) {
            navigate('/app');
        }
        window.scrollTo(0, 0);
    }, [location, navigate]);

    if (!location.state) return null;

    // Mock Data for Premium Features
    const marketTrends = [
        { month: 'Nov', price: 2400 },
        { month: 'Dec', price: 2650 },
        { month: 'Jan', price: 2800 },
        { month: 'Feb', price: 2500 },
    ];

    const soilHealth = {
        nitrogen: 'Low',
        phosphorus: 'Optimal',
        potassium: 'Medium',
        ph: 6.2,
        organicMatter: 'High'
    };

    return (
        <div className="app-container pro-theme">
            {/* Gold/Dark Background Elements */}
            <div className="pro-bg-gradient"></div>

            <header className="app-header pro-header">
                <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Award size={32} className="pro-icon-brand" />
                    <h1 className="pro-brand-title">Krishi Pro</h1>
                </div>
                <button className="editorial-btn-small pro-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> {t.back}
                </button>
            </header>

            <main className="main-content-dashboard relative-z">
                <div className="dashboard-title pro-title">
                    <h2>{t.premium_analysis}</h2>
                    <p>{t.deep_dive} {formData?.district}</p>
                </div>

                <div className="pro-dashboard-grid">

                    {/* 1. Market Intelligence Card */}
                    <motion.div
                        className="pro-card market-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="pro-card-header">
                            <TrendingUp size={24} color="#4ade80" />
                            <h3>{t.market_intelligence}</h3>
                        </div>
                        <p className="pro-card-desc">Real-time prices from nearby mandis to help you sell at the best rate.</p>
                        <div className="market-content">
                            <div className="current-price">
                                <span className="label">{t.current_market_rate}</span>
                                <span className="value">₹2,450 <span className="unit">/quintal</span></span>
                                <span className="trend up">▲ 5.2% {t.this_week}</span>
                            </div>
                            <div className="best-market">
                                <span className="label">{t.best_mandi}</span>
                                <span className="value">Shillong Main Market</span>
                                <span className="distance">12 km away</span>
                            </div>
                            <div className="price-forecast">
                                <h4>{t.price_forecast}</h4>
                                <p className="pro-sub-desc">Expected price trends for the next 4 months.</p>
                                <div className="forecast-bars">
                                    {marketTrends.map((item, index) => (
                                        <div key={index} className="bar-group">
                                            <div className="bar" style={{ height: `${(item.price / 3000) * 100}%` }}></div>
                                            <span className="month">{item.month}</span>
                                            <span className="price">₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Soil Health Card */}
                    <motion.div
                        className="pro-card soil-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="pro-card-header">
                            <Sprout size={24} color="#a3e635" />
                            <h3>{t.soil_health}</h3>
                        </div>
                        <p className="pro-card-desc">Nutrient analysis based on your soil type and crop history.</p>
                        <div className="soil-grid">
                            <div className="soil-item">
                                <span className="label">Nitrogen (N)</span>
                                <div className="progress-bar"><div className="fill low" style={{ width: '40%' }}></div></div>
                                <span className="status warning">{t.low} - {t.add_urea}</span>
                            </div>
                            <div className="soil-item">
                                <span className="label">Phosphorus (P)</span>
                                <div className="progress-bar"><div className="fill optimal" style={{ width: '85%' }}></div></div>
                                <span className="status good">{t.optimal}</span>
                            </div>
                            <div className="soil-item">
                                <span className="label">Potassium (K)</span>
                                <div className="progress-bar"><div className="fill medium" style={{ width: '60%' }}></div></div>
                                <span className="status ok">{t.medium}</span>
                            </div>
                            <div className="soil-item ph-item">
                                <span className="label">pH Level</span>
                                <span className="ph-value">{soilHealth.ph}</span>
                                <span className="status">{t.slightly_acidic}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Crop Doctor / Pest Forecast */}
                    <motion.div
                        className="pro-card pest-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="pro-card-header">
                            <Bug size={24} color="#f87171" />
                            <h3>{t.pest_forecast}</h3>
                        </div>
                        <p className="pro-card-desc">AI-predicted pest risks based on weather patterns.</p>
                        <div className="pest-timeline">
                            <div className="timeline-item warning">
                                <div className="date">Dec 10 - 15</div>
                                <div className="content">
                                    <h4>Stem Borer Attack Risk</h4>
                                    <p>High humidity levels detected. Apply Neem Oil solution preventively.</p>
                                </div>
                            </div>
                            <div className="timeline-item info">
                                <div className="date">Jan 05 - 10</div>
                                <div className="content">
                                    <h4>Leaf Folder Watch</h4>
                                    <p>Monitor leaf tips for folding. Install light traps.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. Smart Calendar */}
                    <motion.div
                        className="pro-card calendar-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="pro-card-header">
                            <Calendar size={24} color="#60a5fa" />
                            <h3>{t.smart_calendar}</h3>
                        </div>
                        <p className="pro-card-desc">Optimized schedule for farming activities to maximize yield.</p>
                        <div className="calendar-list">
                            <div className="cal-item done">
                                <CheckCircle size={16} />
                                <span>Land Preparation (Completed)</span>
                            </div>
                            <div className="cal-item active">
                                <div className="circle"></div>
                                <span>Sowing (Recommended: Dec 1-5)</span>
                            </div>
                            <div className="cal-item future">
                                <div className="circle"></div>
                                <span>First Irrigation (Dec 12)</span>
                            </div>
                            <div className="cal-item future">
                                <div className="circle"></div>
                                <span>Weeding (Dec 25)</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default ProAnalysisPage;
