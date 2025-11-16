import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./App.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// ---- Helpers: fake data generation ----
function generateDateLabels(days) {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return labels;
}

function generateRandomSeries(length, base, variance) {
  const data = [];
  for (let i = 0; i < length; i++) {
    const val = base + (Math.random() - 0.5) * variance;
    data.push(Math.round(val));
  }
  return data;
}

function App() {
  const [range, setRange] = useState(30);
  const [seed, setSeed] = useState(0); // simple way to trigger new random data

  // Recompute when range or seed changes
  const { lineData, lineOptions, barData, barOptions, doughnutData, doughnutOptions } =
    useMemo(() => {
      const labels = generateDateLabels(range);
      const values = generateRandomSeries(range, 500, 200);

      const lineData = {
        labels,
        datasets: [
          {
            label: "Daily Active Users",
            data: values,
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(96,165,250,0.15)",
            borderColor: "rgba(96,165,250,1)",
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      };

      const lineOptions = {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            intersect: false,
            mode: "index",
          },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(55,65,81,0.3)" },
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(31,41,55,0.4)" },
          },
        },
      };

      const barData = {
        labels: ["Organic", "Paid", "Referral", "Social", "Email"],
        datasets: [
          {
            label: "Signups",
            data: [320, 210, 140, 260, 190].map(
              v => v + Math.round((Math.random() - 0.5) * 40)
            ),
            backgroundColor: [
              "rgba(96,165,250,0.8)",
              "rgba(52,211,153,0.8)",
              "rgba(250,204,21,0.8)",
              "rgba(248,113,113,0.8)",
              "rgba(129,140,248,0.8)",
            ],
            borderWidth: 0,
          },
        ],
      };

      const barOptions = {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {},
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(31,41,55,0.4)" },
          },
        },
      };

      const doughnutData = {
        labels: ["Free", "Pro", "Business", "Enterprise"],
        datasets: [
          {
            data: [45, 30, 18, 7],
            backgroundColor: [
              "rgba(96,165,250,0.9)",
              "rgba(52,211,153,0.9)",
              "rgba(251,146,60,0.9)",
              "rgba(248,113,113,0.9)",
            ],
            borderWidth: 0,
          },
        ],
      };

      const doughnutOptions = {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#e5e7eb" },
          },
        },
      };

      return { lineData, lineOptions, barData, barOptions, doughnutData, doughnutOptions };
    }, [range, seed]);

  const handleRefresh = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="title">Product Analytics Dashboard</div>
        <div className="controls">
          <select
            value={range}
            onChange={e => setRange(parseInt(e.target.value, 10))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleRefresh}>Refresh Data</button>
        </div>
      </header>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">12,340</div>
          <div className="kpi-delta positive">▲ 8.4% vs last period</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value">3.9%</div>
          <div className="kpi-delta positive">▲ 0.6 pts</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Revenue</div>
          <div className="kpi-value">$54,210</div>
          <div className="kpi-delta negative">▼ 2.1% vs last period</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <span>Daily Active Users</span>
            <span className="card-subtitle">Last {range} days</span>
          </div>
          <div className="chart-wrapper">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Signups by Channel</span>
            <span className="card-subtitle">Current period</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Plan Breakdown</span>
            <span className="card-subtitle">Active subscriptions</span>
          </div>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
