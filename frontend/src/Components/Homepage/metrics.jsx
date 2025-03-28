export function Metrics() {
  const metrics = [
    { title: "Total Task", value: "2" },
    { title: "To Do", value: "1" },
    { title: "In Progress", value: "1" },
    { title: "Completed", value: "0" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.title} className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-medium text-gray-500">
            {metric.title}
          </h3>
          <p className="mt-2 text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  )
}