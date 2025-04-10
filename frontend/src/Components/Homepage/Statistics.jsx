import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function Statistics({ taskMetrics }) {
  // Mock time-series data (replace with real API data)
  const data = {
    labels: ["Apr 1", "Apr 2", "Apr 3", "Apr 4", "Apr 5"],
    datasets: [
      {
        label: "Completed Tasks",
        data: [2, 3, 5, 4, 6], // Replace with real data
        borderColor: "#22C55E",
        backgroundColor: "#BBF7D0",
        fill: false,
      },
      {
        label: "In Progress Tasks",
        data: [1, 2, 1, 3, 2], // Replace with real data
        borderColor: "#F59E0B",
        backgroundColor: "#FEF3C7",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Count" } },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={data} options={options} />
    </div>
  );
}