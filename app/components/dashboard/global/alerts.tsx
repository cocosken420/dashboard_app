import { Alert, getAlertStyles } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function Alerts({alerts}:{alerts:Alert[]}){
    return <AnimatePresence>
    <div className="fixed top-3 z-50 right-4">
    {alerts.map((alert) => (
      <motion.div
        key={alert.id}
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`${getAlertStyles(alert.type)} relative mt-2  text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border-2`}
      >
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <span className="font-semibold">{alert.message}</span>
      </motion.div>
    ))}
    </div>
  </AnimatePresence>
}
export  const showAlert = (message: string, type: "error" | "success" | "warning" = "error",alerts:Alert[],setAlerts:(e:Alert[])=>void) => {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      message,
      type,
    }
    setAlerts([...alerts, newAlert])
    setTimeout(() => {
      setAlerts(alerts.filter((alert) => alert.id !== newAlert.id))
    }, 3000)
  }
