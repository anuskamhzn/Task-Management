import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faUsers, faChartLine, faBell, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const features = [
    {
      icon: <FontAwesomeIcon icon={faList} style={{ color: "#74C0FC", fontSize: "64px" }} />,
      title: "Task Prioritization",
      description:
        "Easily organize and prioritize your tasks with customizable tags, due dates, and priority levels. Stay focused on what matters most.",
    },
    {
      icon: <FontAwesomeIcon icon={faUsers} style={{ color: "#121212", fontSize: "64px" }} />,
      title: "Collaborative Work",
      description:
        "Collaborate with your team in real-time. Share tasks, deadlines, and updates instantly to keep everyone on the same page.",
    },
    {
      icon: <FontAwesomeIcon icon={faChartLine} style={{ color: "#63E6BE", fontSize: "64px" }} />,
      title: "Progress Tracking",
      description:
        "Track your progress with visual charts, graphs, and reports. Get insights into your productivity and stay motivated.",
    },
    {
      icon: <FontAwesomeIcon icon={faBell} style={{ color: "#ee7c7c", fontSize: "64px" }} />,
      title: "Task Reminders",
      description:
        "Never miss a deadline again. Set personalized reminders for tasks and receive notifications to stay on top of your schedule.",
    },
    {
      icon: <FontAwesomeIcon icon={faTachometerAlt} style={{ color: "#B197FC", fontSize: "64px" }} />,
      title: "Customizable Dashboards",
      description:
        "Tailor your workspace with customizable dashboards. Choose the features and data you want to see at a glance.",
    },
  ];

  const topRowFeatures = features.slice(0, 3);
  const bottomRowFeatures = features.slice(3);

  return (
    <section id="features" className="mt-16 bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Animated Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold text-center text-gray-800 mb-8"
        >
          Key Features
        </motion.h2>

        {/* Top row - 3 cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
            hidden: { opacity: 0 },
          }}
        >
          {topRowFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-lg p-6 text-center"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom row - 2 centered cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
            hidden: { opacity: 0 },
          }}
        >
          {bottomRowFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-lg p-6 text-center"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
