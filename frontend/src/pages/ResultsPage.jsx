import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, CloudRain, Activity, MapPin, Droplets, Thermometer, ChevronRight, CheckCircle, Calendar, Lock, Unlock, ShoppingCart, Bug, TrendingUp, IndianRupee, Globe } from 'lucide-react';
import { translations } from '../utils/translations';
import '../App.css';

const ResultsPage = ({ language, setLanguage }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prediction, erosionRisk, longForecast, aiAdvice, recommendation, formData, inputAreaAcres } = location.state || {};
    const t = translations[language] || translations['en'];

    const [isProUnlocked, setIsProUnlocked] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Redirect if no data (e.g., direct access)
    useEffect(() => {
        if (!location.state) {
            navigate('/app');
        }
    }, [location, navigate]);

    const handleUnlockPro = () => {
        // Simulate payment processing
        setShowPaymentModal(true);
        setTimeout(() => {
            setShowPaymentModal(false);
            // Navigate to Pro Page with all data
            navigate('/pro-analysis', {
                state: {
                    prediction,
                    erosionRisk,
                    longForecast,
                    aiAdvice,
                    recommendation,
                    formData
                }
            });
        }, 2000);
    };

    if (!location.state) return null;

    // Calculate Weather Averages/Totals
    const totalRainfall = longForecast ? longForecast.reduce((sum, day) => sum + day.rain, 0) : 0;
    const avgTemp = longForecast ? Math.round(longForecast.reduce((sum, day) => sum + day.temp, 0) / longForecast.length) : 0;
    const avgHumidity = longForecast ? Math.round(longForecast.reduce((sum, day) => sum + (day.humidity || 70), 0) / longForecast.length) : 70;

    // Convert Yield to Tons/Acre for display if input was in Acres
    // Prediction comes as tons (total) and tons/ha (yield)
    // We want to show tons/acre.
    // 1 Ha = 2.47105 Acres.
    // Yield (tons/ha) / 2.47105 = Yield (tons/acre)
    const yieldPerAcre = prediction && prediction.yield ? prediction.yield / 2.47105 : 0;

    return (
        <div className="app-container editorial-theme">
            {/* Background Grid Lines */}
            <div className="grid-lines fixed">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>

            <header className="app-header editorial-header">
                <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Sprout size={32} color="#1A3C34" />
                    <h1 style={{ color: '#1A3C34', margin: 0, fontSize: '1.5rem' }}>{t.brand}</h1>
                </div>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="lang-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={18} color="#1A3C34" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', color: '#1A3C34', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="kha">Khasi</option>
                        </select>
                    </div>
                    <button className="editorial-btn-small" onClick={() => navigate('/app')}>{t.new_analysis}</button>
                </div>
            </header>

            <main className="main-content-dashboard relative-z">
                <div className="dashboard-title">
                    <h2>{t.results_title}</h2>
                    <p>{t.results_subtitle} {formData?.district}</p>
                </div>

                <motion.div
                    className="results-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* NEW: Yield Prediction Card (The "Actual Results") */}
                    {prediction && (
                        <div className="yield-card editorial-card" style={{ marginBottom: '2rem', borderLeft: '4px solid #1A3C34' }}>
                            <div className="yield-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="icon-bg" style={{ background: '#e6f4f1', padding: '10px', borderRadius: '50%' }}>
                                    <TrendingUp size={24} color="#1A3C34" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: '#1A3C34' }}>{t.yield_prediction}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{t.based_on_ml}</span>
                                </div>
                            </div>

                            <div className="yield-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="stat-box">
                                    <span className="label" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>{t.est_yield}</span>
                                    <span className="value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1A3C34' }}>
                                        {yieldPerAcre.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>tons/acre</span>
                                    </span>
                                </div>
                                <div className="stat-box">
                                    <span className="label" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>{t.total_prod}</span>
                                    <span className="value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1A3C34' }}>
                                        {prediction.production ? prediction.production.toFixed(2) : '0.00'} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>tons</span>
                                    </span>
                                </div>
                                <div className="stat-box">
                                    <span className="label" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>{t.est_cost}</span>
                                    <span className="value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1A3C34', display: 'flex', alignItems: 'center' }}>
                                        <IndianRupee size={20} /> {prediction.estimated_cost ? prediction.estimated_cost.toLocaleString() : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Row: Erosion + Weather Grid */}
                    <div className="results-top-row">
                        {/* Erosion Card */}
                        {erosionRisk && (
                            <div className="erosion-card editorial-card" style={{ background: erosionRisk.color === '#ef4444' ? '#fee2e2' : '#1A3C34', color: 'white' }}>
                                <div className="erosion-header">
                                    <h3>{t.erosion_risk}</h3>
                                    <div className="risk-percentage">{erosionRisk.percentage}%</div>
                                    <div className="soil-badge">
                                        <CheckCircle size={14} /> {erosionRisk.risk === 'Low' ? t.soil_stable : t.soil_unstable}
                                    </div>
                                </div>
                                <div className="recommendation-box">
                                    <h4>{t.recommendation}</h4>
                                    <p>{erosionRisk.risk === 'Low' ? t.cond_optimal : t.cond_risky} {erosionRisk.risk === 'Low' ? t.proceed_standard : t.proceed_caution}</p>
                                </div>
                            </div>
                        )}

                        {/* Weather Grid */}
                        <div className="weather-grid-cards">
                            <div className="weather-stat-card editorial-card">
                                <div className="stat-icon-bg"><CloudRain size={20} color="#3b82f6" /></div>
                                <span className="stat-label">{t.rainfall}</span>
                                <span className="stat-value">{totalRainfall}mm</span>
                                <span className="stat-sub">Next 30 Days</span>
                            </div>
                            <div className="weather-stat-card editorial-card">
                                <div className="stat-icon-bg"><MapPin size={20} color="#8b5cf6" /></div>
                                <span className="stat-label">{t.hill_angle}</span>
                                <span className="stat-value">{formData?.slope === 'Steep' ? '25°' : '10°'}</span>
                                <span className="stat-sub">Slope Steepness</span>
                            </div>
                            <div className="weather-stat-card editorial-card">
                                <div className="stat-icon-bg"><Droplets size={20} color="#0ea5e9" /></div>
                                <span className="stat-label">{t.humidity}</span>
                                <span className="stat-value">{avgHumidity}%</span>
                                <span className="stat-sub">Atmospheric</span>
                            </div>
                            <div className="weather-stat-card editorial-card">
                                <div className="stat-icon-bg"><Thermometer size={20} color="#f97316" /></div>
                                <span className="stat-label">{t.temperature}</span>
                                <span className="stat-value">{avgTemp}°C</span>
                                <span className="stat-sub">Moderate</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Advisory + Pro */}
                    <div className="results-bottom-row">
                        {/* Advisory Card */}
                        {aiAdvice && (
                            <div className="advisory-card editorial-card">
                                <div className="advisory-header">
                                    <div className="advisory-icon-bg"><Sprout size={24} color="#1A3C34" /></div>
                                    <h3>{t.ai_advisory}</h3>
                                </div>

                                <div className="advisory-item">
                                    <div className="advisory-icon"><Sprout size={18} color="#1A3C34" /></div>
                                    <div>
                                        <span className="advisory-label">{t.best_crop}</span>
                                        <div className="advisory-value">
                                            {recommendation && recommendation.best_crop
                                                ? `${recommendation.best_crop.crop} (Yield: ${(recommendation.best_crop.yield / 2.47105).toFixed(2)} t/acre)`
                                                : `${formData?.crop} / Mixed Vegetables`
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="advisory-item">
                                    <div className="advisory-icon"><Calendar size={18} color="#3b82f6" /></div>
                                    <div>
                                        <span className="advisory-label">{t.best_time}</span>
                                        <div className="advisory-value">{aiAdvice.bestTime}</div>
                                    </div>
                                </div>
                                <div className="advisory-item">
                                    <div className="advisory-icon"><Activity size={18} color="#8b5cf6" /></div>
                                    <div>
                                        <span className="advisory-label">{t.fert_schedule}</span>
                                        <div className="advisory-value">{aiAdvice.fertilizer}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pro Card (Dynamic) */}
                        <div className={`pro-card editorial-card ${isProUnlocked ? 'unlocked' : ''}`}>
                            {!isProUnlocked ? (
                                <>
                                    <div className="pro-badge">👑 {t.premium_access}</div>
                                    <h3>{t.upgrade_pro}</h3>
                                    <p>{t.unlock_desc}</p>

                                    <div className="pro-features">
                                        <div className="pro-feature">
                                            <div className="pf-icon">🛒</div>
                                            <span>{t.market_integration}</span>
                                        </div>
                                        <div className="pro-feature">
                                            <div className="pf-icon">🐞</div>
                                            <span>{t.pest_prediction}</span>
                                        </div>
                                    </div>

                                    <div className="price-tag">
                                        <div className="price">₹100 <span className="period">/ season</span></div>
                                    </div>

                                    <button className="pay-btn" onClick={handleUnlockPro}>
                                        {showPaymentModal ? t.processing : t.pay_btn} <ChevronRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="pro-content-unlocked">
                                    <div className="unlocked-header">
                                        <div className="pro-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                                            <Unlock size={12} /> {t.premium_unlocked}
                                        </div>
                                    </div>

                                    <div className="pro-grid">
                                        <div className="pro-detail-card">
                                            <div className="pro-icon-header">
                                                <Bug size={24} color="#ef4444" />
                                                <h4>{t.pest_alert}</h4>
                                            </div>
                                            <p className="alert-text">High risk of <strong>Stem Borer</strong> in next 10 days due to humidity.</p>
                                            <div className="action-box">
                                                <span>{t.rec_action}</span>
                                                <p>Apply Neem Oil 5% spray immediately.</p>
                                            </div>
                                        </div>

                                        <div className="pro-detail-card">
                                            <div className="pro-icon-header">
                                                <ShoppingCart size={24} color="#f59e0b" />
                                                <h4>{t.market_rates}</h4>
                                            </div>
                                            <ul className="market-list">
                                                <li>
                                                    <span>Shillong Mandi</span>
                                                    <span className="rate">₹2,400/q</span>
                                                </li>
                                                <li>
                                                    <span>Tura Market</span>
                                                    <span className="rate">₹2,250/q</span>
                                                </li>
                                                <li>
                                                    <span>Guwahati</span>
                                                    <span className="rate">₹2,550/q</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Simple Payment Modal Overlay */}
            {showPaymentModal && (
                <div className="payment-overlay">
                    <div className="payment-spinner"></div>
                    <p>Processing Secure Payment...</p>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;
