# Smart Soil Health Monitoring System

A full-stack web application prototype for agricultural intelligence in Sri Lanka. This system predicts NPK nutrient levels and waterlogging risk to help farmers prevent crop damage and optimize fertilization schedules.

## Features

### 1. Real-Time Dashboard
- **Current NPK Levels**: Live monitoring of Nitrogen, Phosphorus, and Potassium with status indicators
- **Waterlogging Risk Assessment**: Real-time WFPS (Water-Filled Pore Space) monitoring with risk levels
- **Active Alerts**: Critical notifications for fertilization needs and waterlogging risks
- **Weather Forecast**: 48-hour rainfall prediction and environmental conditions
- **Auto-Refresh**: Data updates every 30 seconds

### 2. NPK Management
- **Historical Trends**: 30-day NPK level visualization with fertilization event markers
- **14-Day Predictions**: Forecasting with critical threshold indicators
- **Smart Recommendations**: Automated fertilization advice with:
  - Optimal timing (within 5-7 days)
  - Fertilizer type and amount
  - Cost savings estimation (₹1,050/season)
- **Fertilization History**: Complete record of past applications

### 3. Waterlogging Monitor
- **Current Status**: WFPS percentage and soil moisture levels
- **48-Hour Forecast**: Interactive chart showing predicted WFPS and rainfall
- **Risk Level Badges**: Color-coded alerts (LOW/MEDIUM/HIGH)
- **Action Checklist**: Recommended preventive measures
- **Economic Impact**: Potential loss prevention (up to ₹20,000)

### 4. Historical Data Analysis
- **Parameter Selection**: Track nitrogen, phosphorus, potassium, moisture, pH, temperature, humidity
- **Flexible Time Ranges**: 1 day to 30 days of historical data
- **Statistics Dashboard**: Current, average, minimum, maximum values
- **Data Export**: CSV download functionality
- **Interactive Charts**: Zoomable trend visualizations

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Data Storage**: In-memory (no external database required)
- **API Design**: RESTful with 6 core endpoints
- **Mock Data Generation**: Realistic agricultural patterns with NPK depletion rates

### Frontend
- **Framework**: React 19 with React Router
- **Styling**: Tailwind CSS with custom "Organic & Earthy" theme
- **Charts**: Recharts library for data visualization
- **Design**: Clean, minimal, mobile-first responsive design
- **Fonts**: Manrope (headings) and Public Sans (body)

## Installation & Setup

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 14+ and Yarn (for frontend)

### Backend Setup

1. Navigate to backend directory:
```bash
cd /app/backend
```

2. Install dependencies (already done in this environment):
```bash
pip install -r requirements.txt
```

3. The backend runs on port 8001 (managed by supervisor):
```bash
# Backend is already running via supervisor
# To restart: sudo supervisorctl restart backend
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd /app/frontend
```

2. Install dependencies (already done in this environment):
```bash
yarn install
```

3. The frontend runs on port 3000 (managed by supervisor):
```bash
# Frontend is already running via supervisor
# To restart: sudo supervisorctl restart frontend
```

## API Endpoints

Base URL: `{REACT_APP_BACKEND_URL}/api`

### 1. GET /api/status
Returns current soil conditions and system status.

**Response Example:**
```json
{
  "nitrogen": 242.1,
  "phosphorus": 55.5,
  "potassium": 381.8,
  "soil_moisture": 35.3,
  "pH": 6.3,
  "npk_status": {
    "nitrogen": "adequate",
    "phosphorus": "adequate",
    "potassium": "adequate"
  },
  "waterlogging_risk": "medium",
  "wfps": 70.6,
  "last_updated": "2026-02-11T12:00:00"
}
```

### 2. GET /api/npk-predictions
Returns NPK forecast and fertilization recommendations.

**Response Example:**
```json
{
  "current": {"N": 242.1, "P": 55.5, "K": 381.8},
  "7_days": {"N": 214.1, "P": 42.9, "K": 359.4},
  "14_days": {"N": 186.1, "P": 30.3, "K": 337.0},
  "recommendation": {
    "action": "monitor",
    "timing": "no action needed",
    "fertilizer_type": "N/A",
    "amount_kg": 0,
    "reason": "Nutrient levels adequate",
    "cost_savings": 1050
  }
}
```

### 3. GET /api/waterlogging-risk
Returns waterlogging prediction and action plan.

**Response Example:**
```json
{
  "current_wfps": 70.6,
  "risk_level": "HIGH",
  "time_to_event_hours": 48,
  "peak_wfps_predicted": 120.6,
  "duration_hours": 12,
  "rainfall_forecast_mm": 25,
  "cause": "Heavy rain (25mm) forecasted",
  "actions": [
    "Cancel irrigation scheduled for tomorrow",
    "Prepare drainage channels",
    "Delay fertilization until soil drains"
  ],
  "potential_loss": 20000
}
```

### 4. GET /api/history?parameter={param}&days={days}
Returns historical data for charts.

**Parameters:**
- `parameter`: nitrogen, phosphorus, potassium, soil_moisture, pH, soil_temp, air_temp, humidity
- `days`: Number of days (default: 7)

**Response Example:**
```json
{
  "parameter": "nitrogen",
  "days": 7,
  "data": [
    {"timestamp": "2026-02-04T12:00:00", "value": 250.2},
    {"timestamp": "2026-02-05T12:00:00", "value": 246.1}
  ]
}
```

### 5. GET /api/alerts
Returns active system alerts.

### 6. GET /api/fertilization-history
Returns past fertilization events.

## Data Simulation

The system generates realistic agricultural data:

- **NPK Depletion Rates**: 
  - Nitrogen: -4 mg/kg per day
  - Phosphorus: -1.8 mg/kg per day
  - Potassium: -3.2 mg/kg per day

- **Fertilization Event**: Simulated 12 days ago showing NPK spike and subsequent depletion

- **Waterlogging Scenario**: Heavy rain forecasted in 48 hours with WFPS exceeding critical 90% threshold

- **30 Days History**: Complete sensor data for trend analysis

## Design System

### Color Palette
- **Primary (Deep Forest Green)**: #1A4D2E
- **Secondary (Brown)**: #8B5E3C
- **Background (Bone White)**: #F9F7F2
- **Success**: #059669
- **Warning**: #D97706
- **Danger**: #DC2626
- **Info**: #0284C7

### Typography
- **Headings**: Manrope (600, 700, 800 weights)
- **Body**: Public Sans (400, 500, 600 weights)

### Status Indicators
- **Green**: Adequate/Good status
- **Yellow**: Warning/Caution
- **Red**: Alert/Critical

## Key Agricultural Metrics

### Critical Thresholds
- **Nitrogen**: < 150 mg/kg (requires fertilization)
- **Phosphorus**: < 30 mg/kg (requires fertilization)
- **Potassium**: < 200 mg/kg (requires fertilization)
- **WFPS**: > 90% (waterlogging risk)

### Economic Impact
- **Fertilizer Cost Savings**: ₹1,050 per season (precision timing)
- **Waterlogging Prevention**: ₹20,000 potential loss avoided
- **Recovery Time**: 7-14 days after waterlogging damage

## Farm Profile (Demo Data)
- **Farmer**: Ravi
- **Crop**: Tomatoes
- **Field Size**: 1 hectare
- **Growth Stage**: Day 25 after planting

## Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Bottom navigation bar on mobile devices
- Touch-friendly targets (minimum 44x44px)
- Optimized layouts for smartphone screens
- Large, readable fonts for outdoor visibility

## Testing

Comprehensive testing completed:
- ✅ All 6 backend API endpoints
- ✅ Dashboard data loading and display
- ✅ NPK Management charts and predictions
- ✅ Waterlogging risk assessment
- ✅ Historical data analysis and export
- ✅ Desktop and mobile navigation
- ✅ Responsive design adaptation
- ✅ Data visualization rendering
- ✅ Auto-refresh functionality

**Test Results**: 
- Backend: 100% (10/10 tests passed)
- Frontend: 95% (minor console warnings only)
- Integration: 100%

## Future Enhancements

1. **Real Weather API Integration**: Connect to actual weather services
2. **Multi-Field Management**: Support for multiple farm plots
3. **SMS Alerts**: Send critical notifications to farmers
4. **IoT Sensor Integration**: Connect real soil sensors
5. **Crop-Specific Recommendations**: Tailored advice for different crops
6. **Historical Analytics**: ML-based pattern recognition
7. **Mobile App**: Native iOS/Android applications
8. **Multi-Language Support**: Sinhala and Tamil translations

## Screenshots

### Desktop View
- **Dashboard**: 4-card grid with NPK status, waterlogging risk, alerts, and weather
- **NPK Management**: Historical trends with area charts and prediction line charts
- **Waterlogging Monitor**: Risk assessment with 48-hour forecast
- **History Page**: Parameter selection with interactive charts and data tables

### Mobile View
- Responsive card stacking
- Bottom navigation bar
- Optimized touch targets
- Readable fonts for outdoor use

## Support & Documentation

For questions or issues:
1. Check the test reports in `/app/test_reports/`
2. Review API endpoint documentation above
3. Examine component code in `/app/frontend/src/pages/`

## License

Prototype for demonstration purposes - Smart Soil Health Monitoring System for Sri Lankan Agriculture.

---

**Built with ❤️ for farmers in Sri Lanka**
