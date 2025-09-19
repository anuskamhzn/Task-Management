import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faUsers, faChartLine, faBell, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const features = [
    {
      icon: <FontAwesomeIcon icon={faList} style={{ color: "#74C0FC", fontSize: "48px" }} />,
      title: "Task Prioritization",
      description:
        "Easily organize and prioritize your tasks with customizable tags, due dates, and priority levels. Stay focused on what matters most.",
    },
    {
      icon: <FontAwesomeIcon icon={faUsers} style={{ color: "#121212", fontSize: "48px" }} />,
      title: "Collaborative Work",
      description:
        "Collaborate with your team in real-time. Share tasks, deadlines, and updates instantly to keep everyone on the same page.",
    },
    {
      icon: <FontAwesomeIcon icon={faChartLine} style={{ color: "#63E6BE", fontSize: "48px" }} />,
      title: "Progress Tracking",
      description:
        "Track your progress with visual charts, graphs, and reports. Get insights into your productivity and stay motivated.",
    },
    {
      icon: <FontAwesomeIcon icon={faBell} style={{ color: "#ee7c7c", fontSize: "48px" }} />,
      title: "Task Reminders",
      description:
        "Never miss a deadline again. Set personalized reminders for tasks and receive notifications to stay on top of your schedule.",
    },
    {
      icon: <FontAwesomeIcon icon={faTachometerAlt} style={{ color: "#B197FC", fontSize: "48px" }} />,
      title: "Customizable Dashboards",
      description:
        "Tailor your workspace with customizable dashboards. Choose the features and data you want to see at a glance.",
    },
  ];

  return (
    <section id="features" className="bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-6 sm:mb-8"
        >
          Features
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
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
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-lg p-4 sm:p-6 text-center"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">{feature.icon}</div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">{feature.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}