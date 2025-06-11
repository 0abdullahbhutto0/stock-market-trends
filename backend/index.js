require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to database');
    release();
});

// API Routes
app.get('/api/stock-data', async (req, res) => {
    try {
        // Get latest stock prices with company information
        const stockData = await pool.query(`
            SELECT 
                c.symbol,
                c.name,
                c.sector,
                sp.date,
                sp.open,
                sp.high,
                sp.low,
                sp.close,
                sp.volume,
                c.market_cap,
                ti.sma_20,
                ti.sma_50,
                ti.rsi
            FROM companies c
            JOIN stock_prices sp ON c.company_id = sp.company_id
            LEFT JOIN technical_indicators ti ON c.company_id = ti.company_id AND sp.date = ti.date
            WHERE sp.date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY sp.date DESC, c.symbol
        `);

        // Get sector performance
        const sectorPerformance = await pool.query(`
            SELECT 
                s.sector_name,
                sp.date,
                sp.avg_price,
                sp.total_volume,
                sp.change_percent,
                SUM(c.market_cap) as total_market_cap
            FROM sector_performance sp
            JOIN sectors s ON sp.sector_id = s.sector_id
            JOIN companies c ON c.sector_id = s.sector_id
            WHERE sp.date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY s.sector_name, sp.date, sp.avg_price, sp.total_volume, sp.change_percent
            ORDER BY sp.date DESC
        `);

        // Get latest news
        const latestNews = await pool.query(`
            SELECT 
                na.title,
                na.url,
                na.published_at,
                na.sentiment_score,
                c.symbol
            FROM news_articles na
            JOIN companies c ON na.company_id = c.company_id
            ORDER BY na.published_at DESC
            LIMIT 10
        `);

        // Get all available market indices data
        const marketIndicesRaw = await pool.query(`
            SELECT mi.name, mi.symbol, ip.date, ip.close, ip.volume
            FROM market_indices mi
            JOIN index_prices ip ON mi.index_id = ip.index_id
            ORDER BY mi.name, ip.date ASC
        `);

        // Process market indices for charting
        const indicesMap = {};
        marketIndicesRaw.rows.forEach(row => {
            if (!indicesMap[row.symbol]) {
                indicesMap[row.symbol] = {
                    name: row.name,
                    symbol: row.symbol,
                    prices: [],
                    dates: [],
                    volume: 0
                };
            }
            indicesMap[row.symbol].prices.push(Number(row.close));
            indicesMap[row.symbol].dates.push(row.date);
            indicesMap[row.symbol].volume = Number(row.volume); // last one will be latest
        });
        const marketIndices = {
            indices: Object.values(indicesMap),
            volumesPie: Object.values(indicesMap).map(idx => ({ name: idx.name, symbol: idx.symbol, volume: idx.volume }))
        };

        // Get index components with proper joins and calculations
        const indexComponentsQuery = `
            SELECT 
                mi.name as index_name,
                c.symbol,
                ic.weight,
                sp.close as price,
                ((sp.close - LAG(sp.close) OVER (PARTITION BY c.symbol ORDER BY sp.date)) / 
                 LAG(sp.close) OVER (PARTITION BY c.symbol ORDER BY sp.date) * 100) as change
            FROM index_components ic
            JOIN market_indices mi ON ic.index_id = mi.index_id
            JOIN companies c ON ic.company_id = c.company_id
            JOIN stock_prices sp ON c.company_id = sp.company_id
            WHERE sp.date = (
                SELECT MAX(date) 
                FROM stock_prices 
                WHERE company_id = c.company_id
            )
            ORDER BY mi.name, ic.weight DESC
        `;

        // Get recent earnings reports
        const earningsReports = await pool.query(`
            SELECT 
                c.symbol,
                er.period_start,
                er.period_end,
                er.revenue,
                er.net_income,
                er.earnings_per_share,
                er.report_date
            FROM earnings_reports er
            JOIN companies c ON er.company_id = c.company_id
            WHERE er.report_date >= CURRENT_DATE - INTERVAL '90 days'
            ORDER BY er.report_date DESC
            LIMIT 20
        `);

        // Process data for charts
        const dates = [...new Set(stockData.rows.map(row => row.date))].sort();
        const symbols = [...new Set(stockData.rows.map(row => row.symbol))];

        // Create price data structure
        const priceData = {};
        symbols.forEach(symbol => {
            priceData[symbol] = {
                dates: [],
                prices: [],
                volumes: []
            };
        });

        stockData.rows.forEach(row => {
            priceData[row.symbol].dates.push(row.date);
            priceData[row.symbol].prices.push(Number(row.close));
            priceData[row.symbol].volumes.push(Number(row.volume));
        });

        // Process technical indicators
        const technicalIndicators = {};
        symbols.forEach(symbol => {
            const rows = stockData.rows.filter(row => row.symbol === symbol);
            technicalIndicators[symbol] = {
                dates: rows.map(row => row.date),
                sma20: rows.map(row => row.sma_20 !== null ? Number(row.sma_20) : null),
                sma50: rows.map(row => row.sma_50 !== null ? Number(row.sma_50) : null),
                rsi: rows.map(row => row.rsi !== null ? Number(row.rsi) : null)
            };
        });

        // Process sector performance
        const sectorData = {};
        sectorPerformance.rows.forEach(row => {
            if (!sectorData[row.sector_name]) {
                sectorData[row.sector_name] = {
                    change_percent: Number(row.change_percent),
                    total_market_cap: Number(row.total_market_cap)
                };
            }
        });

        // Create market overview with proper number formatting
        const marketOverview = symbols.map(symbol => {
            const companyData = stockData.rows.find(row => row.symbol === symbol);
            const latestPrice = Number(companyData.close);
            const previousPrice = Number(stockData.rows.find(row => 
                row.symbol === symbol && 
                row.date < companyData.date
            )?.close || latestPrice);
            
            const change = ((latestPrice - previousPrice) / previousPrice) * 100;

            return {
                symbol: symbol,
                name: companyData.name,
                price: latestPrice,
                change: change,
                volume: Number(companyData.volume),
                marketCap: Number(companyData.market_cap),
                sector: companyData.sector
            };
        });

        // Process index components data
        const indexComponentsResult = await pool.query(indexComponentsQuery);
        const indexComponents = indexComponentsResult.rows.map(row => ({
            index_name: row.index_name,
            symbol: row.symbol,
            weight: Number(row.weight),
            price: Number(row.price),
            change: Number(row.change || 0) // Handle null values for change
        }));

        // Format earnings data
        const formattedEarnings = earningsReports.rows.map(row => ({
            symbol: row.symbol,
            period_start: row.period_start,
            period_end: row.period_end,
            revenue: Number(row.revenue),
            net_income: Number(row.net_income),
            earnings_per_share: Number(row.earnings_per_share),
            report_date: row.report_date
        }));

        res.json({
            priceData,
            sectorPerformance: sectorData,
            latestNews: latestNews.rows,
            marketOverview,
            technicalIndicators,
            marketIndices,
            indexComponents: indexComponents,
            earnings: formattedEarnings
        });

    } catch (error) {
        console.error('Error in /api/stock-data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// POST API to create a user and add a watchlist entry
app.post('/api/users', async (req, res) => {
    const { username, email, company_ids } = req.body;
    if (!username || !email || !company_ids || !Array.isArray(company_ids) || company_ids.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Insert new user
        const userResult = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING user_id',
            [username, email]
        );
        const user_id = userResult.rows[0].user_id;
        // Insert watchlist entries for each company
        for (const company_id of company_ids) {
            await pool.query(
                'INSERT INTO watchlists (user_id, company_id) VALUES ($1, $2)',
                [user_id, company_id]
            );
        }
        res.status(201).json({ message: 'User and watchlist created successfully', user_id });
    } catch (error) {
        console.error('Error creating user and watchlist:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint to get all companies for dropdown
app.get('/api/companies', async (req, res) => {
    try {
        const result = await pool.query('SELECT company_id, symbol, name FROM companies ORDER BY symbol');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint to login a user (by username or email)
app.post('/api/login', async (req, res) => {
    const { username, email } = req.body;
    if (!username && !email) {
        return res.status(400).json({ error: 'Username or email required' });
    }
    try {
        const userResult = await pool.query(
            'SELECT user_id, username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1',
            [username, email]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];
        // Fetch watchlist
        const watchlistResult = await pool.query(
            `SELECT w.company_id, c.symbol, c.name FROM watchlists w JOIN companies c ON w.company_id = c.company_id WHERE w.user_id = $1`,
            [user.user_id]
        );
        res.json({ user, watchlist: watchlistResult.rows });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint to get a user's watchlist
app.get('/api/watchlist/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT w.company_id, c.symbol, c.name FROM watchlists w JOIN companies c ON w.company_id = c.company_id WHERE w.user_id = $1',
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint working' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
