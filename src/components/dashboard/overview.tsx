"use client"

export function Overview() {
  return (
    <div className="h-[350px] flex items-center justify-center">
      <div className="space-y-4 w-full">
        {/* Simple bar chart representation */}
        <div className="flex items-end justify-between h-64 gap-4">
          {[
            { month: "Jan", value: 80 },
            { month: "Feb", value: 45 },
            { month: "Mar", value: 90 },
            { month: "Apr", value: 60 },
            { month: "May", value: 75 },
            { month: "Jun", value: 95 },
            { month: "Jul", value: 70 },
            { month: "Aug", value: 85 },
            { month: "Sep", value: 55 },
            { month: "Oct", value: 80 },
            { month: "Nov", value: 90 },
            { month: "Dec", value: 100 },
          ].map((item) => (
            <div key={item.month} className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-primary rounded-t-md transition-all hover:opacity-80" 
                   style={{ height: `${item.value}%` }} />
              <span className="text-xs text-muted-foreground">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
