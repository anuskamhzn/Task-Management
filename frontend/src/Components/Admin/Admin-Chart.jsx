export default function AdminChart() {
    return (
      <div className="relative w-full h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>1200</div>
          <div>900</div>
          <div>600</div>
          <div>300</div>
          <div>0</div>
        </div>
  
        {/* Chart content */}
        <div className="ml-12 h-full flex items-end">
          {/* Bars */}
          {[65, 75, 90, 82, 70, 85, 95, 80, 88, 92, 78, 85].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-6 bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
              <div className="text-xs text-gray-500 mt-1">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index]}
              </div>
            </div>
          ))}
  
          {/* Line overlay - simplified representation */}
          <div className="absolute top-0 left-12 right-0 h-full">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <path
                d="M0,140 C50,120 100,80 150,100 S250,180 300,150 S400,100 500,50 S650,120 700,80 S850,100 1000,60"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              <path
                d="M0,140 C50,120 100,80 150,100 S250,180 300,150 S400,100 500,50 S650,120 700,80 S850,100 1000,60"
                fill="rgba(16, 185, 129, 0.1)"
                strokeWidth="0"
              />
            </svg>
          </div>
        </div>
      </div>
    )
  }
  