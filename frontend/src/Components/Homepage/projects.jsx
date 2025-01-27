export function Projects() {
  const tasks = ["Task 1", "Task 2", "Task 3", "Task 4"]

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Projects</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task} className="rounded-lg bg-gray-100 p-4 transition-colors hover:bg-gray-200">
              {task}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

