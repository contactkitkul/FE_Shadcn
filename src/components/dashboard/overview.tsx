"use client";

import { subDays, subMonths, startOfMonth, endOfMonth, format } from "date-fns";

interface OverviewProps {
  data?: Array<{
    date: Date | string;
    revenue: number;
    orders: number;
  }>;
  dateFilter?: string;
  dashboardType?: string;
  isComparison?: boolean;
}

export function Overview({ data: apiData, dateFilter = "7days", dashboardType = "days", isComparison = false }: OverviewProps) {
  const generateData = () => {
    // If real data is provided, use it
    if (apiData && apiData.length > 0) {
      return apiData.map(item => ({
        name: format(new Date(item.date), "MMM dd"),
        revenue: item.revenue,
        orders: item.orders,
        shirts: item.orders * 1.5, // Estimate shirts from orders
        comparisonRevenue: item.revenue * 0.85, // Mock comparison data
        comparisonOrders: item.orders * 0.9,
        comparisonShirts: item.orders * 1.35,
      }));
    }

    // Otherwise, generate mock data
    const mockData = [];
    let periods = 14;
    let dateFormat = "MMM dd";
    let subtractFn = subDays;
    
    // Determine periods based on filter and type
    if (dashboardType === "months") {
      // Always show 6 months for monthly view
      periods = 6;
      dateFormat = "MMM";
      subtractFn = subMonths;
    } else {
      // Days view - use dateFilter
      switch (dateFilter) {
        case "7days":
          periods = 7;
          break;
        case "14days":
          periods = 14;
          break;
        case "30days":
          periods = 30;
          break;
        case "mtd":
          const monthStart = startOfMonth(new Date());
          const today = new Date();
          periods = Math.ceil((today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          break;
        default:
          periods = 7;
      }
      dateFormat = "MMM dd";
      subtractFn = subDays;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = subtractFn(new Date(), i);
      const baseRevenue = dashboardType === "months" ? 15000 : 1000;
      const baseOrders = dashboardType === "months" ? 500 : 50;
      const baseShirts = dashboardType === "months" ? 800 : 80;
      
      mockData.push({
        date: format(date, dateFormat),
        revenue: Math.floor(Math.random() * baseRevenue + baseRevenue),
        orders: Math.floor(Math.random() * baseOrders + baseOrders),
        shirts: Math.floor(Math.random() * baseShirts + baseShirts),
      });
    }
    return mockData;
  };

  const generateComparisonData = () => {
    const currentData = generateData();
    const comparisonData = [];
    
    // For days view, generate comparison data (same period but 30 days before)
    if (dashboardType === "days") {
      const periods = currentData.length;
      const offset = 30; // 30 days before
      
      for (let i = periods - 1; i >= 0; i--) {
        const date = subDays(new Date(), i + offset);
        comparisonData.push({
          date: format(date, "MMM dd"),
          revenue: Math.floor(Math.random() * 800 + 800), // Slightly lower for comparison
          orders: Math.floor(Math.random() * 40 + 40),
          shirts: Math.floor(Math.random() * 60 + 60),
        });
      }
    }
    
    return { currentData, comparisonData };
  };

  const { currentData, comparisonData } = generateComparisonData();
  
  // For Recent Days Performance: show current period data + comparison lines
  // For Comparison Analysis (months): show only monthly data
  let data;
  let showBothPeriods = false;
  
  if (dashboardType === "months") {
    // Monthly data for Comparison Analysis
    data = currentData;
    showBothPeriods = false;
  } else {
    // Days data for Recent Days Performance
    data = currentData;
    showBothPeriods = !isComparison; // Show comparison lines only for Recent Days Performance
  }
  
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxOrders = Math.max(...data.map((d) => d.orders));
  const maxShirts = Math.max(...data.map((d) => d.shirts));

  // Create SVG path for line charts
  const createLinePath = (dataPoints: number[], max: number) => {
    return dataPoints
      .map((point, index) => {
        const x = 50 + (index * 300) / (dataPoints.length - 1);
        const y = 170 - (point / max) * 150;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const ordersPath = createLinePath(data.map(d => d.orders), maxOrders);
  const shirtsPath = createLinePath(data.map(d => d.shirts), maxShirts);
  
  // Create comparison paths if showing both periods
  let comparisonOrdersPath = '';
  let comparisonShirtsPath = '';
  if (showBothPeriods && comparisonData.length > 0) {
    const maxComparisonOrders = Math.max(...comparisonData.map(d => d.orders));
    const maxComparisonShirts = Math.max(...comparisonData.map(d => d.shirts));
    comparisonOrdersPath = createLinePath(comparisonData.map(d => d.orders), maxComparisonOrders);
    comparisonShirtsPath = createLinePath(comparisonData.map(d => d.shirts), maxComparisonShirts);
  }

  return (
    <div className="w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Revenue Columns */}
        {data.map((item, index) => {
          const barWidth = 300 / data.length * 0.6;
          const barX = 50 + (index * 300) / data.length + (300 / data.length - barWidth) / 2;
          const barHeight = (item.revenue / maxRevenue) * 150;
          const barY = 170 - barHeight;
          
          return (
            <rect
              key={`bar-${index}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="#ec4899"
              opacity="0.8"
              rx="2"
            >
              <title>Revenue: €{item.revenue.toLocaleString()}</title>
            </rect>
          );
        })}
        
        {/* Current Period Orders Line */}
        <path
          d={ordersPath}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Current Period Orders Points */}
        {data.map((item, index) => {
          const x = 50 + (index * 300) / (data.length - 1);
          const y = 170 - (item.orders / maxOrders) * 150;
          return (
            <circle
              key={`orders-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
            >
              <title>Orders: {item.orders}</title>
            </circle>
          );
        })}
        
        {/* Current Period Shirts Line */}
        <path
          d={shirtsPath}
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Current Period Shirts Points */}
        {data.map((item, index) => {
          const x = 50 + (index * 300) / (data.length - 1);
          const y = 170 - (item.shirts / maxShirts) * 150;
          return (
            <circle
              key={`shirts-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="#10b981"
            >
              <title>Shirts: {item.shirts}</title>
            </circle>
          );
        })}
        
        {/* Comparison Period Lines (if showing both periods) */}
        {showBothPeriods && comparisonData.length > 0 && (
          <>
            {/* Comparison Orders Line */}
            <path
              d={comparisonOrdersPath}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            
            {/* Comparison Orders Points */}
            {comparisonData.map((item, index) => {
              const x = 50 + (index * 300) / (comparisonData.length - 1);
              const y = 170 - (item.orders / Math.max(...comparisonData.map(d => d.orders))) * 150;
              return (
                <circle
                  key={`comp-orders-${index}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#3b82f6"
                  opacity="0.6"
                >
                  <title>Orders (30 days ago): {item.orders}</title>
                </circle>
              );
            })}
            
            {/* Comparison Shirts Line */}
            <path
              d={comparisonShirtsPath}
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            
            {/* Comparison Shirts Points */}
            {comparisonData.map((item, index) => {
              const x = 50 + (index * 300) / (comparisonData.length - 1);
              const y = 170 - (item.shirts / Math.max(...comparisonData.map(d => d.shirts))) * 150;
              return (
                <circle
                  key={`comp-shirts-${index}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#10b981"
                  opacity="0.6"
                >
                  <title>Shirts (30 days ago): {item.shirts}</title>
                </circle>
              );
            })}
          </>
        )}
        
        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = 50 + (index * 300) / (data.length - 1);
          return (
            <text
              key={`label-${index}`}
              x={x}
              y="190"
              textAnchor="middle"
              className="text-xs fill-gray-500"
              transform={`rotate(-45 ${x} 190)`}
            >
              {item.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
