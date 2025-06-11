// Chart configurations
let priceChart, volumeChart, maChart, rsiChart, sectorChart, sectorPieChart, indicesChart;
let watchlistChart;
let indicesPriceChart, indicesVolumePieChart;

// Carousel state
let currentPriceBatch = 0;
let currentVolumeBatch = 0;
let currentMABatch = 0;
let currentRSIBatch = 0;
const BATCH_SIZE = 5;

// Initialize charts
function initializeCharts() {
    // Common dark theme styling
    const darkTheme = {
        backgroundColor: 'rgba(30, 33, 42, 0.95)',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#9CA3AF',
        titleColor: '#E5E7EB'
    };

    // Initialize price chart if element exists
    const priceCtx = document.getElementById('priceChart');
    if (priceCtx) {
        priceChart = new Chart(priceCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: darkTheme.backgroundColor,
                plugins: {
                    title: {
                        display: true,
                        text: 'Stock Price Trends',
                        color: darkTheme.titleColor,
                        font: {
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: darkTheme.textColor,
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: darkTheme.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            },
                            maxRotation: 0,
                            maxTicksLimit: 15,
                            callback: function(value, index) {
                                const label = this.getLabelForValue(value);
                                if (!label) return '';
                                
                                // Parse date and format nicely
                                const date = new Date(label);
                                if (isNaN(date)) return label;
                                
                                // Show every 2-3 days based on data density
                                const totalTicks = this.chart.data.labels.length;
                                let skipFactor;
                                
                                if (totalTicks <= 30) {
                                    skipFactor = 2; // Show every 2nd day for small datasets
                                } else if (totalTicks <= 60) {
                                    skipFactor = 3; // Show every 3rd day for medium datasets
                                } else {
                                    skipFactor = Math.ceil(totalTicks / 20); // Adaptive for large datasets
                                }
                                
                                if (index % skipFactor === 0 || index === 0 || index === totalTicks - 1) {
                                    return date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric'
                                    });
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: darkTheme.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4,
                        borderWidth: 2
                    },
                    point: {
                        radius: 0,
                        hoverRadius: 6,
                        hitRadius: 10
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                }
            }
        });
    }

    // Initialize volume chart if element exists
    const volumeCtx = document.getElementById('volumeChart');
    if (volumeCtx) {
        volumeChart = new Chart(volumeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: darkTheme.backgroundColor,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trading Volume',
                        color: darkTheme.titleColor,
                        font: {
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: darkTheme.textColor,
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: darkTheme.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            },
                            maxRotation: 0,
                            maxTicksLimit: 15,
                            callback: function(value, index) {
                                const label = this.getLabelForValue(value);
                                if (!label) return '';
                                
                                // Parse date and format nicely
                                const date = new Date(label);
                                if (isNaN(date)) return label;
                                
                                // Show every 2-3 days based on data density
                                const totalTicks = this.chart.data.labels.length;
                                let skipFactor;
                                
                                if (totalTicks <= 30) {
                                    skipFactor = 2; // Show every 2nd day for small datasets
                                } else if (totalTicks <= 60) {
                                    skipFactor = 3; // Show every 3rd day for medium datasets
                                } else {
                                    skipFactor = Math.ceil(totalTicks / 20); // Adaptive for large datasets
                                }
                                
                                if (index % skipFactor === 0 || index === 0 || index === totalTicks - 1) {
                                    return date.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric'
                                    });
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: darkTheme.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                // Format large numbers (e.g., 1000000 -> 1M)
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 2,
                        borderSkipped: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                }
            }
        });
    }

    // Initialize moving averages chart if element exists
    const maCtx = document.getElementById('maChart');
    maChart = new Chart(maCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Moving Averages',
                    color: darkTheme.titleColor,
                    font: {
                        size: 18,
                        weight: 'bold',
                        family: 'Inter, Arial, sans-serif'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: darkTheme.textColor,
                        font: {
                            size: 14,
                            weight: '500',
                            family: 'Inter, Arial, sans-serif'
                        },
                        boxWidth: 20,
                        boxHeight: 10,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: darkTheme.tooltipBgColor,
                    titleColor: darkTheme.tooltipTextColor,
                    bodyColor: darkTheme.tooltipTextColor,
                    borderColor: darkTheme.tooltipBorderColor,
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            layout: {
                padding: {
                    left: 16,
                    right: 16,
                    top: 16,
                    bottom: 16
                }
            },
            elements: {
                line: {
                    borderWidth: 3,
                    tension: 0.4, // smooth curves
                    borderCapStyle: 'round'
                },
                point: {
                    radius: 3,
                    backgroundColor: darkTheme.pointColor,
                    borderColor: darkTheme.pointBorderColor,
                    borderWidth: 2,
                    hoverRadius: 5
                }
            },
            scales: {
                x: {
                    grid: {
                        color: darkTheme.gridColor,
                        lineWidth: 1,
                        drawBorder: false
                    },
                    ticks: {
                        color: darkTheme.textColor,
                        font: {
                            size: 12,
                            family: 'Inter, Arial, sans-serif'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: darkTheme.gridColor,
                        lineWidth: 1,
                        drawBorder: false
                    },
                    ticks: {
                        color: darkTheme.textColor,
                        font: {
                            size: 12,
                            family: 'Inter, Arial, sans-serif'
                        }
                    }
                }
            }
        }
    })

    // Initialize RSI chart if element exists
    const rsiCtx = document.getElementById('rsiChart');
    if (rsiCtx) {
        rsiChart = new Chart(rsiCtx.getContext('2d'), {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'RSI Indicator',
                        color: darkTheme.titleColor,
                        font: {
                            size: 18,
                            weight: 'bold',
                            family: 'Inter, Arial, sans-serif'
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: darkTheme.textColor,
                            font: {
                                size: 14,
                                weight: '500',
                                family: 'Inter, Arial, sans-serif'
                            },
                            boxWidth: 20,
                            boxHeight: 10,
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: darkTheme.textColor,
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 16,
                        right: 16,
                        top: 16,
                        bottom: 16
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2,
                        tension: 0.4,
                        borderCapStyle: 'round'
                    },
                    point: {
                        radius: 2,
                        hitRadius: 10,
                        hoverRadius: 6
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            },
                            tooltipFormat: 'MMM d, yyyy'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11,
                                family: 'Inter, Arial, sans-serif'
                            },
                            maxTicksLimit: 6,
                            maxRotation: 0,
                            autoSkip: true
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: darkTheme.gridColor,
                            lineWidth: 1,
                            drawBorder: false
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11,
                                family: 'Inter, Arial, sans-serif'
                            },
                            stepSize: 20
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                }
            }
        });
    }

    // Initialize sector performance chart if element exists
    const sectorCtx = document.getElementById('sectorChart');
    if (sectorCtx) {
        sectorChart = new Chart(sectorCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: darkTheme.backgroundColor,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 15,
                        right: 15
                    }
                },
                plugins: {
                    title: {
                        display: false, // Remove since you'll have card title
                    },
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            color: darkTheme.textColor,
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'rect',
                            font: {
                                size: 12
                            },
                            boxWidth: 12,
                            boxHeight: 12
                        },
                        maxHeight: 60
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: darkTheme.textColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: darkTheme.gridColor,
                            lineWidth: 1
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 0
                        },
                        border: {
                            color: darkTheme.gridColor
                        }
                    },
                    y: {
                        grid: {
                            color: darkTheme.gridColor,
                            lineWidth: 1
                        },
                        ticks: {
                            color: darkTheme.textColor,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return value + '%';
                            },
                            padding: 10
                        },
                        border: {
                            color: darkTheme.gridColor
                        },
                        beginAtZero: true
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        });
    }

    // Initialize sector pie chart if element exists
    const sectorPieCtx = document.getElementById('sectorPieChart');
    if (sectorPieCtx) {
        sectorPieChart = new Chart(sectorPieCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sector Distribution',
                        color: darkTheme.titleColor,
                        font: {
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            color: darkTheme.textColor,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            },
                            boxWidth: 12,
                            boxHeight: 12
                        },
                        maxHeight: 100
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: darkTheme.textColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2,
                        borderColor: darkTheme.backgroundColor || '#1a1a2e',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#ffffff'
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Initialize market indices chart if element exists
    const indicesCtx = document.getElementById('indicesChart');
    if (indicesCtx) {
        indicesChart = new Chart(indicesCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: darkTheme.backgroundColor,
                plugins: {
                    title: {
                        display: true,
                        text: 'Major Market Indices',
                        color: darkTheme.titleColor,
                        font: {
                            size: 16,
                            weight: '600'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: darkTheme.textColor
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: darkTheme.gridColor
                        },
                        ticks: {
                            color: darkTheme.textColor
                        }
                    },
                    y: {
                        grid: {
                            color: darkTheme.gridColor
                        },
                        ticks: {
                            color: darkTheme.textColor
                        }
                    }
                }
            }
        });
    }

    // Initialize market indices price chart
    const indicesPriceCtx = document.getElementById('indicesPriceChart');
    if (indicesPriceCtx) {
        indicesPriceChart = new Chart(indicesPriceCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Index Prices (Last 2 Days)',
                        color: '#E5E7EB',
                        font: { size: 16, weight: '600' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#9CA3AF',
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
                        ticks: { color: '#9CA3AF', font: { size: 12 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
                        ticks: { color: '#9CA3AF', font: { size: 12 } }
                    }
                },
                elements: {
                    line: { tension: 0.4, borderWidth: 2 },
                    point: { radius: 4, hoverRadius: 7, hitRadius: 10 }
                },
                interaction: { mode: 'nearest', intersect: false, axis: 'x' }
            }
        });
    }

    // Initialize market indices volume pie chart
    const indicesVolumePieCtx = document.getElementById('indicesVolumePie');
    if (indicesVolumePieCtx) {
        indicesVolumePieChart = new Chart(indicesVolumePieCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{ data: [], backgroundColor: [] }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Index Volume Distribution',
                        color: '#E5E7EB',
                        font: { size: 16, weight: '600' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            color: '#9CA3AF',
                            usePointStyle: true,
                            font: { size: 12 },
                            boxWidth: 12, boxHeight: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#9CA3AF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2,
                        borderColor: '#1a1a2e',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#ffffff'
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// Color palette matching your dashboard
const stockColors = {
    AAPL: '#10B981',  // Emerald green
    AMZN: '#EF4444',  // Red
    GOOGL: '#3B82F6', // Blue
    JNJ: '#F59E0B',   // Amber
    JPM: '#8B5CF6',   // Purple
    MSFT: '#EC4899',  // Pink
    TSLA: '#14B8A6',  // Teal
    V: '#F97316',     // Orange
    NVDA: '#6366F1',   // Indigo
    PG: '#84CC16'    // Lime
};

// Helper function to add datasets with proper styling
function addStockDataset(chart, symbol, data, label) {
    const color = stockColors[symbol] || '#6B7280';
    
    if (chart === priceChart) {
        chart.data.datasets.push({
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color + '20', // 20% opacity
            fill: false,
            tension: 0.4
        });
    } else if (chart === volumeChart) {
        chart.data.datasets.push({
            label: label,
            data: data,
            backgroundColor: color + '80', // 50% opacity
            borderColor: color,
            borderWidth: 1
        });
    }
    
    chart.update();
}

// Fetch data from backend
async function fetchData() {
    try {
        console.log('Fetching data from API...');
        const response = await fetch('http://localhost:3000/api/stock-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('marketIndices:', JSON.stringify(data.marketIndices, null, 2));
        window._lastPriceData = data.priceData;
        // Only reset carousel states here, not in updateCharts
        currentPriceBatch = 0;
        currentVolumeBatch = 0;
        currentMABatch = 0;
        currentRSIBatch = 0;
        console.log('Data received:', data);

        // Fix: technicalIndicators is now an object keyed by symbol
        if (data.technicalIndicators && Object.keys(data.technicalIndicators).length > 0) {
            const firstSymbol = Object.keys(data.technicalIndicators)[0];
            if (firstSymbol) {
                console.log('MA Dates:', data.technicalIndicators[firstSymbol]?.dates);
                console.log('SMA20:', data.technicalIndicators[firstSymbol]?.sma20);
                console.log('SMA50:', data.technicalIndicators[firstSymbol]?.sma50);
                console.log('RSI:', data.technicalIndicators[firstSymbol]?.rsi);
            }
        }

        // Remove or update any code that assumes technicalIndicators.dates, .sma20, etc.
        // (No need to set minDate/maxDate here for charting, handled in update functions)

        updateAllData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('marketData').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error loading data: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Carousel functions
function prevPriceBatch() {
    const symbols = Object.keys(window._lastPriceData || {});
    if (currentPriceBatch > 0) {
        currentPriceBatch--;
    } else {
        // Wrap around to last batch
        currentPriceBatch = Math.floor((symbols.length - 1) / BATCH_SIZE);
    }
    updatePriceChartBatch();
}

function nextPriceBatch() {
    const symbols = Object.keys(window._lastPriceData || {});
    if ((currentPriceBatch + 1) * BATCH_SIZE < symbols.length) {
        currentPriceBatch++;
    } else {
        // Wrap around to first batch
        currentPriceBatch = 0;
    }
    updatePriceChartBatch();
}

function prevVolumeBatch() {
    const symbols = Object.keys(window._lastPriceData || {});
    if (currentVolumeBatch > 0) {
        currentVolumeBatch--;
    } else {
        // Wrap around to last batch
        currentVolumeBatch = Math.floor((symbols.length - 1) / BATCH_SIZE);
    }
    updateVolumeChartBatch();
}

function nextVolumeBatch() {
    const symbols = Object.keys(window._lastPriceData || {});
    if ((currentVolumeBatch + 1) * BATCH_SIZE < symbols.length) {
        currentVolumeBatch++;
    } else {
        // Wrap around to first batch
        currentVolumeBatch = 0;
    }
    updateVolumeChartBatch();
}

function updatePriceChartBatch() {
    if (!priceChart || !window._lastPriceData) return;
    
    const symbols = Object.keys(window._lastPriceData);
    const startIdx = currentPriceBatch * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, symbols.length);
    const currentSymbols = symbols.slice(startIdx, endIdx);
    
    // Update chart with current batch
    const firstSymbol = currentSymbols[0];
    const rawDates = window._lastPriceData[firstSymbol]?.dates || [];
    const dateIndexPairs = rawDates.map((date, index) => ({ date, index }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDates = dateIndexPairs.map(pair => pair.date);
    const sortedIndices = dateIndexPairs.map(pair => pair.index);
    
    priceChart.data.labels = sortedDates;
    priceChart.data.datasets = currentSymbols.map((symbol) => {
        const color = stockColors[symbol] || '#6B7280';
        const sortedPrices = sortedIndices.map(index => window._lastPriceData[symbol].prices[index]);
        
        return {
            label: symbol,
            data: sortedPrices,
            borderColor: color,
            backgroundColor: color + '20',
            fill: false,
            tension: 0.4
        };
    });
    priceChart.update();
    // Always enable both buttons
    const prevButton = document.querySelector('.price-chart .carousel-btn.prev');
    const nextButton = document.querySelector('.price-chart .carousel-btn.next');
    if (prevButton) prevButton.disabled = false;
    if (nextButton) nextButton.disabled = false;
}

function updateVolumeChartBatch() {
    if (!volumeChart || !window._lastPriceData) return;
    
    const symbols = Object.keys(window._lastPriceData);
    const startIdx = currentVolumeBatch * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, symbols.length);
    const currentSymbols = symbols.slice(startIdx, endIdx);
    
    // Update chart with current batch
    const firstSymbol = currentSymbols[0];
    const rawDates = window._lastPriceData[firstSymbol]?.dates || [];
    const dateIndexPairs = rawDates.map((date, index) => ({ date, index }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDates = dateIndexPairs.map(pair => pair.date);
    const sortedIndices = dateIndexPairs.map(pair => pair.index);
    
    volumeChart.data.labels = sortedDates;
    volumeChart.data.datasets = currentSymbols.map((symbol) => {
        const color = stockColors[symbol] || '#6B7280';
        const sortedVolumes = sortedIndices.map(index => window._lastPriceData[symbol].volumes[index]);
        
        return {
            label: symbol,
            data: sortedVolumes,
            backgroundColor: color + '80',
            borderColor: color,
            borderWidth: 1
        };
    });
    volumeChart.update();
    // Always enable both buttons
    const prevButton = document.querySelector('.volume-chart .carousel-btn.prev');
    const nextButton = document.querySelector('.volume-chart .carousel-btn.next');
    if (prevButton) prevButton.disabled = false;
    if (nextButton) nextButton.disabled = false;
}

// Update charts with new data
function updateCharts(data) {
    try {
        const { priceData, sectorPerformance, technicalIndicators, marketIndices } = data;
        
        // Store price data globally for carousel functionality
        window._lastPriceData = priceData;
        window._lastTechnicalData = technicalIndicators;
        
        // Do NOT reset carousel states here!
        // Update price chart if it exists
        if (priceChart && priceData) {
            updatePriceChartBatch();
        }

        // Update volume chart if it exists
        if (volumeChart && priceData) {
            updateVolumeChartBatch();
        }

        // Update Moving Averages if chart exists
        if (maChart && technicalIndicators) {
            updateMAChartBatch();
        }

        // Update RSI if chart exists
        if (rsiChart && technicalIndicators) {
            updateRSIChartBatch();
        }

        // Update sector charts if they exist
        if (sectorChart && sectorPerformance) {
            const sectors = Object.keys(sectorPerformance);
            const performance = sectors.map(sector => sectorPerformance[sector].change_percent);
            
            sectorChart.data.labels = sectors;
            sectorChart.data.datasets = [{
                label: 'Performance',
                data: performance,
                backgroundColor: performance.map(value => 
                    value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                )
            }];
            sectorChart.update();

            // Update Sector Distribution
            const marketCaps = sectors.map(sector => sectorPerformance[sector].total_market_cap);
            sectorPieChart.data.labels = sectors;
            sectorPieChart.data.datasets[0].data = marketCaps;
            sectorPieChart.data.datasets[0].backgroundColor = sectors.map((_, i) => 
                getRandomColor(i, 0.8)
            );
            sectorPieChart.update();
        }

        // Update Market Indices if chart exists
        if (marketIndices) {
            console.log('Calling updateMarketIndicesCharts with:', marketIndices);
            updateMarketIndicesCharts(marketIndices);
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function updateMAChartBatch() {
    if (!maChart || !window._lastTechnicalData) return;
    
    const symbols = Object.keys(window._lastTechnicalData);
    const startIdx = currentMABatch * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, symbols.length);
    const currentSymbols = symbols.slice(startIdx, endIdx);
    
    // Update chart with current batch
    const firstSymbol = currentSymbols[0];
    let dates = window._lastTechnicalData[firstSymbol]?.dates || [];
    // Sort dates in ascending order and reorder SMA arrays accordingly
    const dateIndexPairs = dates.map((date, idx) => ({ date, idx }));
    dateIndexPairs.sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDates = dateIndexPairs.map(pair => pair.date);
    const sortedIndices = dateIndexPairs.map(pair => pair.idx);
    maChart.data.labels = sortedDates;
    maChart.data.datasets = currentSymbols.flatMap(symbol => {
        const color = stockColors[symbol] || '#6B7280';
        const data = window._lastTechnicalData[symbol];
        // Reorder SMA arrays to match sorted dates
        const sma20 = sortedIndices.map(i => data.sma20[i]);
        const sma50 = sortedIndices.map(i => data.sma50[i]);
        return [
            {
                label: `${symbol} SMA 20`,
                data: sma20,
                borderColor: color,
                backgroundColor: color + '20',
                fill: false,
                tension: 0.4
            },
            {
                label: `${symbol} SMA 50`,
                data: sma50,
                borderColor: color + '80',
                backgroundColor: color + '40',
                fill: false,
                tension: 0.4,
                borderDash: [5, 5]
            }
        ];
    });
    // Fix x-axis label clutter: match RSI chart style
    if (maChart.options && maChart.options.scales && maChart.options.scales.x) {
        maChart.options.scales.x.ticks = {
            color: maChart.options.scales.x.ticks?.color || '#9CA3AF',
            font: maChart.options.scales.x.ticks?.font || { size: 12, family: 'Inter, Arial, sans-serif' },
            maxTicksLimit: 6,
            callback: function(value, index, ticks) {
                // Show only a few date labels, similar to RSI
                const totalTicks = ticks.length;
                const skipFactor = Math.ceil(totalTicks / 6);
                if (index % skipFactor === 0 || index === 0 || index === totalTicks - 1) {
                    const date = new Date(sortedDates[index]);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return '';
            }
        };
    }
    maChart.update();
    // Always enable both buttons
    const prevButton = document.querySelector('.ma-chart .carousel-btn.prev');
    const nextButton = document.querySelector('.ma-chart .carousel-btn.next');
    if (prevButton) prevButton.disabled = false;
    if (nextButton) nextButton.disabled = false;
}

function updateRSIChartBatch() {
    if (!rsiChart || !window._lastTechnicalData) return;
    
    const symbols = Object.keys(window._lastTechnicalData);
    const startIdx = currentRSIBatch * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, symbols.length);
    const currentSymbols = symbols.slice(startIdx, endIdx);
    
    // Update chart with current batch
    const firstSymbol = currentSymbols[0];
    const dates = window._lastTechnicalData[firstSymbol]?.dates || [];
    
    rsiChart.data.labels = dates;
    rsiChart.data.datasets = currentSymbols.map(symbol => {
        const color = stockColors[symbol] || '#6B7280';
        const data = window._lastTechnicalData[symbol];
        
        return {
            label: `${symbol} RSI`,
            data: data.rsi,
            borderColor: color,
            backgroundColor: color + '20',
            fill: false,
            tension: 0.4
        };
    });
    
    rsiChart.update();
    // Always enable both buttons
    const prevButton = document.querySelector('.rsi-chart .carousel-btn.prev');
    const nextButton = document.querySelector('.rsi-chart .carousel-btn.next');
    if (prevButton) prevButton.disabled = false;
    if (nextButton) nextButton.disabled = false;
}

function prevMABatch() {
    const symbols = Object.keys(window._lastTechnicalData || {});
    if (currentMABatch > 0) {
        currentMABatch--;
    } else {
        // Wrap around to last batch
        currentMABatch = Math.floor((symbols.length - 1) / BATCH_SIZE);
    }
    updateMAChartBatch();
}

function nextMABatch() {
    const symbols = Object.keys(window._lastTechnicalData || {});
    if ((currentMABatch + 1) * BATCH_SIZE < symbols.length) {
        currentMABatch++;
    } else {
        // Wrap around to first batch
        currentMABatch = 0;
    }
    updateMAChartBatch();
}

function prevRSIBatch() {
    const symbols = Object.keys(window._lastTechnicalData || {});
    if (currentRSIBatch > 0) {
        currentRSIBatch--;
    } else {
        // Wrap around to last batch
        currentRSIBatch = Math.floor((symbols.length - 1) / BATCH_SIZE);
    }
    updateRSIChartBatch();
}

function nextRSIBatch() {
    const symbols = Object.keys(window._lastTechnicalData || {});
    if ((currentRSIBatch + 1) * BATCH_SIZE < symbols.length) {
        currentRSIBatch++;
    } else {
        // Wrap around to first batch
        currentRSIBatch = 0;
    }
    updateRSIChartBatch();
}

// Update market overview table
function updateMarketTable(data) {
    try {
        const tableBody = document.getElementById('marketData');
        if (!data.marketOverview || data.marketOverview.length === 0) {
            throw new Error('No market overview data available');
        }

        tableBody.innerHTML = '';
        console.log('Updating market table with', data.marketOverview.length, 'entries');

        data.marketOverview.forEach(stock => {
            const price = Number(stock.price);
            const change = Number(stock.change);
            const volume = Number(stock.volume);
            const marketCap = Number(stock.marketCap);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>$${isNaN(price) ? '-' : price.toFixed(2)}</td>
                <td style="color: ${change >= 0 ? '#10B981' : '#EF4444'}; text-align: right; font-weight: 500;">
                    ${isNaN(change) ? '-' : (change >= 0 ? '+' : '') + change.toFixed(2) + '%'}
                </td>
                <td>${isNaN(volume) ? '-' : volume.toLocaleString()}</td>
                <td>$${isNaN(marketCap) ? '-' : (marketCap / 1000000).toFixed(2)}M</td>
                <td>${stock.sector}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating market table:', error);
        document.getElementById('marketData').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error updating market data: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Update news section
function updateNewsSection(data) {
    const newsSection = document.getElementById('newsSection');
    if (!newsSection) return;
    if (!data.latestNews || !Array.isArray(data.latestNews) || data.latestNews.length === 0) {
        newsSection.innerHTML = '<div class="text-center text-muted">No news available.</div>';
        return;
    }
    newsSection.innerHTML = data.latestNews.map(news => {
        const sentiment = Number(news.sentiment_score);
        let sentimentClass = 'sentiment-neutral';
        if (!isNaN(sentiment)) {
            if (sentiment > 0.1) sentimentClass = 'sentiment-positive';
            else if (sentiment < -0.1) sentimentClass = 'sentiment-negative';
        }
        return `
            <div class="news-item" style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: #e5e7eb;">${news.title}</div>
                <div style="color: #94a3b8; font-size: 0.95rem;">
                    ${news.published_at ? new Date(news.published_at).toLocaleString() : ''} &mdash; ${news.symbol || ''}
                    <span class="${sentimentClass}" style="margin-left: 1rem;">
                        Sentiment: ${isNaN(sentiment) ? '-' : sentiment.toFixed(2)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to generate random colors
function getRandomColor(index, alpha = 1) {
    const colors = [
        `rgba(75, 192, 192, ${alpha})`,
        `rgba(255, 99, 132, ${alpha})`,
        `rgba(54, 162, 235, ${alpha})`,
        `rgba(255, 206, 86, ${alpha})`,
        `rgba(153, 102, 255, ${alpha})`
    ];
    return colors[index % colors.length];
}

// Update index components table
function updateIndexComponents(data) {
    try {
        const tableBody = document.getElementById('indexComponents');
        if (!data.indexComponents || data.indexComponents.length === 0) {
            throw new Error('No index components data available');
        }

        tableBody.innerHTML = '';
        data.indexComponents.forEach(component => {
            const price = Number(component.price);
            const change = Number(component.change);
            const weight = Number(component.weight);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${component.index_name}</td>
                <td>${component.symbol}</td>
                <td>${(weight * 100).toFixed(2)}%</td>
                <td>$${price.toFixed(2)}</td>
                <td style="color: ${change >= 0 ? '#10B981' : '#EF4444'};">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating index components:', error);
        document.getElementById('indexComponents').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Error loading index components: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Update stock ticker
function updateStockTicker(data) {
    const ticker = document.getElementById('stockTicker');
    if (!ticker) return;

    const tickerItems = data.marketOverview.map(stock => {
        const price = Number(stock.price);
        const change = Number(stock.change);
        
        return `
            <div class="ticker-item">
                <span class="symbol">${stock.symbol}</span>
                <span class="price">$${price.toFixed(2)}</span>
                <span class="change ${change >= 0 ? 'positive' : 'negative'}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </span>
            </div>
        `;
    }).join('');

    // Create a duplicate of the ticker items for seamless looping
    ticker.innerHTML = tickerItems + tickerItems;
}

// Calculate and update fear and greed indicator
function updateFearAndGreed(data) {
    const sentimentBar = document.getElementById('sentimentBar');
    const sentimentValue = document.getElementById('sentimentValue');
    if (!sentimentBar || !sentimentValue) return;

    // Debug: Check if news data exists
    console.log('News data:', data.latestNews);
    
    // Check if latestNews exists and has data
    if (!data.latestNews || !Array.isArray(data.latestNews) || data.latestNews.length === 0) {
        console.warn('No news data available for sentiment analysis');
        sentimentValue.textContent = 'No Data';
        sentimentBar.style.width = '0%';
        return;
    }

    // Calculate average sentiment from news with error handling
    const validSentiments = data.latestNews
        .map(news => {
            // Check multiple possible property names for sentiment
            const sentiment = news.sentiment_score || news.sentiment || news.sentimentScore || 0;
            return parseFloat(sentiment);
        })
        .filter(score => !isNaN(score)); // Filter out NaN values

    console.log('Valid sentiments:', validSentiments);

    // If no valid sentiments found, use neutral
    if (validSentiments.length === 0) {
        console.warn('No valid sentiment scores found');
        const sentimentPercentage = 50; // Default to neutral
        const sentimentText = 'Neutral';
        const barColor = '#F59E0B';
        
        sentimentBar.style.width = `${sentimentPercentage}%`;
        sentimentBar.style.backgroundColor = barColor;
        sentimentValue.textContent = `${sentimentText} (No Data)`;
        sentimentValue.style.color = barColor;
        return;
    }

    const avgSentiment = validSentiments.reduce((a, b) => a + b, 0) / validSentiments.length;

    // Convert sentiment to percentage (0-100)
    // Assuming sentiment scores are between -1 and 1
    const sentimentPercentage = Math.max(0, Math.min(100, ((avgSentiment + 1) / 2) * 100));

    // Determine sentiment category and colors
    let sentimentText, barColor, textColor;
    
    if (sentimentPercentage < 30) {
        sentimentText = 'Fear';
        barColor = '#EF4444'; // Red
        textColor = '#EF4444';
    } else if (sentimentPercentage < 70) {
        sentimentText = 'Neutral';
        barColor = '#F59E0B'; // Amber/Yellow
        textColor = '#F59E0B';
    } else {
        sentimentText = 'Greed';
        barColor = '#10B981'; // Green
        textColor = '#10B981';
    }

    // Update bar styling
    sentimentBar.style.width = `${sentimentPercentage}%`;
    sentimentBar.style.backgroundColor = barColor;
    sentimentBar.style.transition = 'all 0.3s ease';
    sentimentBar.style.height = '100%';
    sentimentBar.style.borderRadius = '4px';

    // Update the text value and color
    sentimentValue.textContent = `${sentimentText} (${sentimentPercentage.toFixed(0)})`;
    sentimentValue.style.color = textColor;
    sentimentValue.style.fontWeight = '600';

    // Debug logging
    console.log(`Fear & Greed: ${sentimentText} - ${sentimentPercentage.toFixed(1)}% (avg sentiment: ${avgSentiment.toFixed(3)})`);
    console.log(`Valid sentiment count: ${validSentiments.length}`);
}

// Update earnings table with proper formatting
function updateEarningsTable(data) {
    try {
        const tableBody = document.getElementById('earningsData');
        if (!data.earnings || data.earnings.length === 0) {
            throw new Error('No earnings data available');
        }

        tableBody.innerHTML = '';
        data.earnings.forEach(earnings => {
            const revenue = Number(earnings.revenue);
            const netIncome = Number(earnings.net_income);
            const eps = Number(earnings.earnings_per_share);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${earnings.symbol}</td>
                <td>${new Date(earnings.period_start).toLocaleDateString()} - ${new Date(earnings.period_end).toLocaleDateString()}</td>
                <td>$${(revenue / 1000000).toFixed(2)}M</td>
                <td>$${(netIncome / 1000000).toFixed(2)}M</td>
                <td class="${eps >= 0 ? 'positive' : 'negative'}">$${eps.toFixed(2)}</td>
                <td>${new Date(earnings.report_date).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating earnings table:', error);
        document.getElementById('earningsData').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading earnings data: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Update market indices
function updateMarketIndicesCharts(marketIndices) {
    console.log('updateMarketIndicesCharts called with:', marketIndices);
    // Price line chart
    if (indicesPriceChart && marketIndices && marketIndices.indices) {
        // Assume all indices have the same two dates
        const labels = marketIndices.indices[0]?.dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [];
        indicesPriceChart.data.labels = labels;
        indicesPriceChart.data.datasets = marketIndices.indices.map((idx, i) => ({
            label: idx.name,
            data: idx.prices,
            borderColor: getRandomColor(i),
            backgroundColor: getRandomColor(i, 0.1),
            fill: false,
            tension: 0.4
        }));
        indicesPriceChart.update();
    }
    // Volume pie chart
    if (indicesVolumePieChart && marketIndices && marketIndices.volumesPie) {
        indicesVolumePieChart.data.labels = marketIndices.volumesPie.map(idx => idx.name);
        indicesVolumePieChart.data.datasets[0].data = marketIndices.volumesPie.map(idx => idx.volume);
        indicesVolumePieChart.data.datasets[0].backgroundColor = marketIndices.volumesPie.map((_, i) => getRandomColor(i, 0.8));
        indicesVolumePieChart.update();
    }
}

// Update all data
function updateAllData(data) {
    updateCharts(data);
    updateMarketTable(data);
    updateNewsSection(data);
    updateStockTicker(data);
    updateFearAndGreed(data);
    updateEarningsTable(data);
    updateMarketIndicesCharts(data.marketIndices);
}

// Navigation handling
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// --- Profile & Watchlist Section Logic ---
let currentProfile = null;

async function fetchCompanies() {
    try {
        const res = await fetch('http://localhost:3000/api/companies');
        if (!res.ok) throw new Error('Failed to fetch companies');
        return await res.json();
    } catch (err) {
        console.error('Error fetching companies:', err);
        return [];
    }
}

function populateCompanyDropdown(companies) {
    const select = document.getElementById('companySelect');
    select.innerHTML = '';
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.company_id;
        option.textContent = `${company.symbol} - ${company.name}`;
        select.appendChild(option);
    });
}

async function handleRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const companySelect = document.getElementById('companySelect');
    const company_ids = Array.from(companySelect.selectedOptions).map(opt => Number(opt.value));
    if (company_ids.length === 0) {
        alert('Please select at least one company for your watchlist.');
        return;
    }
    try {
        const res = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, company_ids })
        });
        const data = await res.json();
        if (res.ok) {
            currentProfile = { user_id: data.user_id, username, email };
            await showWatchlist(currentProfile.user_id);
            setUserUIState('loggedIn');
        } else {
            alert('Error: ' + (data.error || 'Registration failed'));
        }
    } catch (err) {
        alert('Error registering profile. Please try again.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const loginVal = document.getElementById('login_username').value;
    if (!loginVal) return;
    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginVal, email: loginVal })
        });
        const data = await res.json();
        if (res.ok) {
            currentProfile = data.user;
            await showWatchlist(currentProfile.user_id, data.watchlist);
            setUserUIState('loggedIn');
        } else {
            alert('Login failed: ' + (data.error || 'User not found'));
        }
    } catch (err) {
        alert('Error logging in. Please try again.');
    }
}

function handleLogout() {
    currentProfile = null;
    setUserUIState('loggedOut');
    document.getElementById('watchlistPanel').innerHTML = '';
    renderWatchlistChart([], {});
}

async function showWatchlist(user_id, watchlistData = null) {
    const panel = document.getElementById('watchlistPanel');
    panel.innerHTML = '<div>Loading watchlist...</div>';
    let watchlist = watchlistData;
    if (!watchlist) {
        try {
            const res = await fetch(`http://localhost:3000/api/watchlist/${user_id}`);
            if (!res.ok) throw new Error('Failed to fetch watchlist');
            watchlist = await res.json();
        } catch (err) {
            panel.innerHTML = '<div class="text-danger">Error loading watchlist.</div>';
            renderWatchlistChart([], {});
            return;
        }
    }
    if (!watchlist || watchlist.length === 0) {
        panel.innerHTML = '<div>No companies in your watchlist.</div>';
        renderWatchlistChart([], {});
        return;
    }
    panel.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0;">
        ${watchlist.map(item => `<li style="padding: 0.5rem 0; border-bottom: 1px solid #333;">${item.symbol} - ${item.name}</li>`).join('')}
    </ul>`;
    // Use global priceData from last fetchData
    if (window._lastPriceData) {
        renderWatchlistChart(watchlist, window._lastPriceData);
    } else {
        // Fallback: fetch all data and extract priceData
        try {
            const res = await fetch('http://localhost:3000/api/stock-data');
            const data = await res.json();
            window._lastPriceData = data.priceData;
            renderWatchlistChart(watchlist, data.priceData);
        } catch (err) {
            renderWatchlistChart([], {});
        }
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('watchlistCard').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('userForm').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('watchlistCard').style.display = 'none';
}

function showWatchlistUI() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('watchlistCard').style.display = 'block';
}

function setUserUIState(state) {
    if (state === 'loggedIn') {
        showWatchlistUI();
    } else {
        showLoginForm();
    }
}

// Initialize Profile & Watchlist section
async function initUserWatchlistSection() {
    const companies = await fetchCompanies();
    populateCompanyDropdown(companies);
    setUserUIState('loggedOut');
    document.getElementById('userForm').addEventListener('submit', handleRegistration);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('showSignupLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });
    document.getElementById('backToLoginLink').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    fetchData();
    // Hamburger menu logic
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    // Navigation logic for dashboard sections
    const navLinkEls = document.querySelectorAll('.nav-links .nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    navLinkEls.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinkEls.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.slice(1);
                sections.forEach(sec => {
                    if (sec.id === sectionId) {
                        sec.classList.add('active');
                    } else {
                        sec.classList.remove('active');
                    }
                });
            }
            // Close nav on mobile after click
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
            }
        });
    });

    // Profile form logic
    const loginForm = document.getElementById('loginForm');
    const userForm = document.getElementById('userForm');
    const showSignupLink = document.getElementById('showSignupLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const watchlistCard = document.getElementById('watchlistCard');
    const watchlistPanel = document.getElementById('watchlistPanel');

    // Helper to show error
    function showFormError(form, msg) {
        let err = form.querySelector('.form-error');
        if (!err) {
            err = document.createElement('div');
            err.className = 'form-error';
            err.style.color = '#EF4444';
            err.style.margin = '0.5rem 0';
            form.insertBefore(err, form.firstChild);
        }
        err.textContent = msg;
    }

    if (showSignupLink && loginForm && userForm) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            userForm.style.display = '';
        });
    }
    if (backToLoginLink && loginForm && userForm) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            userForm.style.display = 'none';
            loginForm.style.display = '';
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Add your logout logic here
            window.location.reload();
        });
    }

    // AJAX login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = loginForm.querySelector('[name="username"]').value;
            try {
                const res = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');
                // Show watchlist and logout
                loginForm.style.display = 'none';
                userForm.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = '';
                if (watchlistCard) watchlistCard.style.display = '';
                if (watchlistPanel) {
                    watchlistPanel.innerHTML = '<div>Loading watchlist...</div>';
                    if (data.watchlist && data.watchlist.length > 0) {
                        watchlistPanel.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0;">${data.watchlist.map(item => `<li style=\"padding: 0.5rem 0; border-bottom: 1px solid #333;\">${item.symbol} - ${item.name}</li>`).join('')}</ul>`;
                        // Render the watchlist chart, fetch price data if needed
                        if (window._lastPriceData) {
                            renderWatchlistChart(data.watchlist, window._lastPriceData);
                        } else {
                            fetch('http://localhost:3000/api/stock-data')
                                .then(res => res.json())
                                .then(stockData => {
                                    window._lastPriceData = stockData.priceData;
                                    renderWatchlistChart(data.watchlist, window._lastPriceData);
                                });
                        }
                    } else {
                        watchlistPanel.innerHTML = '<div>No companies in your watchlist.</div>';
                        renderWatchlistChart([], {});
                    }
                }
            } catch (err) {
                showFormError(loginForm, err.message);
            }
        });
    }

    // Company grid only for signup
    if (userForm) {
        populateCompanyGrid();
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            let hidden = userForm.querySelector('input[name="company_ids"]');
            if (!hidden) {
                hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = 'company_ids';
                userForm.appendChild(hidden);
            }
            // Send company_ids as array, not string
            hidden.value = JSON.stringify(selectedCompanyIds);
            const usernameField = userForm.querySelector('[name="username"]');
            const emailField = userForm.querySelector('[name="email"]');
            if (!usernameField || !emailField) {
                showFormError(userForm, 'Profile Name and Email are required.');
                return;
            }
            const username = usernameField.value;
            const email = emailField.value;
            const company_ids = selectedCompanyIds;
            try {
                const res = await fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, company_ids })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Signup failed');
                // Show watchlist and logout
                loginForm.style.display = 'none';
                userForm.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = '';
                if (watchlistCard) watchlistCard.style.display = '';
                if (watchlistPanel) {
                    // Fetch the new user's watchlist and render it and the chart
                    watchlistPanel.innerHTML = '<div>Loading watchlist...</div>';
                    // Use the returned user_id to fetch the watchlist
                    if (data.user_id) {
                        fetch(`http://localhost:3000/api/watchlist/${data.user_id}`)
                            .then(res => res.json())
                            .then(watchlist => {
                                if (Array.isArray(watchlist) && watchlist.length > 0) {
                                    watchlistPanel.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0;">${watchlist.map(item => `<li style=\"padding: 0.5rem 0; border-bottom: 1px solid #333;\">${item.symbol} - ${item.name}</li>`).join('')}</ul>`;
                                    if (window._lastPriceData) {
                                        renderWatchlistChart(watchlist, window._lastPriceData);
                                    }
                                } else {
                                    watchlistPanel.innerHTML = '<div>No companies in your watchlist.</div>';
                                    renderWatchlistChart([], {});
                                }
                            });
                    } else {
                        watchlistPanel.innerHTML = '<div>Profile created! Add companies to your watchlist.</div>';
                        renderWatchlistChart([], {});
                    }
                }
            } catch (err) {
                showFormError(userForm, err.message);
            }
        });
    }
});

function renderWatchlistChart(watchlist, priceData) {
    const ctx = document.getElementById('watchlistChart').getContext('2d');
    if (watchlistChart) {
        watchlistChart.destroy();
    }
    // Use the same dark theme as priceChart
    const darkTheme = {
        backgroundColor: 'rgba(30, 33, 42, 0.95)',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#9CA3AF',
        titleColor: '#E5E7EB'
    };
    // Gather symbols in watchlist that exist in priceData
    const symbols = watchlist.map(item => item.symbol).filter(symbol => priceData[symbol]);
    if (symbols.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    // Use the first symbol's dates as x-axis
    const firstSymbol = symbols[0];
    const rawDates = priceData[firstSymbol]?.dates || [];
    const dateIndexPairs = rawDates.map((date, index) => ({ date, index }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDates = dateIndexPairs.map(pair => pair.date);
    const sortedIndices = dateIndexPairs.map(pair => pair.index);
    // Build datasets for each symbol
    const datasets = symbols.map(symbol => {
        const color = stockColors[symbol] || '#6B7280';
        const sortedPrices = sortedIndices.map(index => priceData[symbol].prices[index]);
        return {
            label: symbol,
            data: sortedPrices,
            borderColor: color,
            backgroundColor: color + '20',
            fill: false,
            tension: 0.4
        };
    });
    watchlistChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: darkTheme.backgroundColor,
            plugins: {
                title: {
                    display: true,
                    text: 'Watchlist Stock Price Trends',
                    color: darkTheme.titleColor,
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: darkTheme.textColor,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: darkTheme.gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: darkTheme.textColor,
                        font: {
                            size: 11
                        },
                        maxRotation: 0,
                        maxTicksLimit: 15,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            if (!label) return '';
                            const date = new Date(label);
                            if (isNaN(date)) return label;
                            const totalTicks = this.chart.data.labels.length;
                            let skipFactor;
                            if (totalTicks <= 30) {
                                skipFactor = 2;
                            } else if (totalTicks <= 60) {
                                skipFactor = 3;
                            } else {
                                skipFactor = Math.ceil(totalTicks / 20);
                            }
                            if (index % skipFactor === 0 || index === 0 || index === totalTicks - 1) {
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }
                            return '';
                        }
                    }
                },
                y: {
                    grid: {
                        color: darkTheme.gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: darkTheme.textColor,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4,
                    borderWidth: 2
                },
                point: {
                    radius: 0,
                    hoverRadius: 6,
                    hitRadius: 10
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    });
}

// --- Company selection grid logic ---
let selectedCompanyIds = [];

async function populateCompanyGrid() {
    const grid = document.getElementById('companyGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="color:#aaa;">Loading companies...</div>';
    try {
        const res = await fetch('http://localhost:3000/api/companies');
        const companies = await res.json();
        grid.innerHTML = '';
        companies.forEach(company => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'company-btn';
            btn.textContent = `${company.symbol} - ${company.name}`;
            btn.dataset.id = company.company_id;
            btn.onclick = () => {
                const id = company.company_id;
                if (selectedCompanyIds.includes(id)) {
                    selectedCompanyIds = selectedCompanyIds.filter(cid => cid !== id);
                    btn.classList.remove('selected');
                } else {
                    selectedCompanyIds.push(id);
                    btn.classList.add('selected');
                }
            };
            grid.appendChild(btn);
        });
    } catch (err) {
        grid.innerHTML = '<div style="color:#e57373;">Failed to load companies.</div>';
    }
} 