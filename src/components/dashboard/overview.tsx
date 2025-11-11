"use client"

import { subDays, format } from "date-fns"

export function Overview() {
  // Generate last 14 days of data
  const generateData = () => {
    const data = []
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i)
      data.push({
        date: format(date, "MMM dd"),
        sales: Math.floor(Math.random() * 5000) + 1000, // Random sales data
        orders: Math.floor(Math.random() * 50) + 10,
        products: Math.floor(Math.random() * 100) + 20,
      })
    }
    return data
  }

  const last14Days = generateData()
  const maxSales = Math.max(...last14Days.map(d => d.sales))

  return (
    <div className="h-[350px]">
      <div className="space-y-4 w-full h-full">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-muted-foreground">Sales (€)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-muted-foreground">Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-muted-foreground">Products Sold</span>
          </div>
        </div>
        {/* Bar chart for last 14 days */}
        <div className="flex items-end justify-between h-64 gap-1">
          {last14Days.map((item, index) => {
            const maxOrders = Math.max(...last14Days.map(d => d.orders));
            const maxProducts = Math.max(...last14Days.map(d => d.products));
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="w-full flex flex-col justify-end items-center h-56">
                  <div 
                    className="w-full bg-primary rounded-t-sm transition-all hover:opacity-80 mb-1" 
                    style={{ height: `${Math.max((item.sales / maxSales) * 180, 4)}px` }}
                    title={`Sales: €${item.sales}`}
                  />
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all hover:opacity-80 mb-1" 
                    style={{ height: `${Math.max((item.orders / maxOrders) * 60, 2)}px` }}
                    title={`Orders: ${item.orders}`}
                  />
                  <div 
                    className="w-full bg-green-500 rounded-t-sm transition-all hover:opacity-80" 
                    style={{ height: `${Math.max((item.products / maxProducts) * 40, 2)}px` }}
                    title={`Products: ${item.products}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground text-center pt-2">
          Last 14 days performance
        </div>
      </div>
    </div>
  )
}
