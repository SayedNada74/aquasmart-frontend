"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Droplets,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  Utensils,
  Wind,
  Zap,
} from "lucide-react";
import { onValue, ref, set, update } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { database } from "@/lib/firebase";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";
import { TaskScheduleModal } from "@/components/control/TaskScheduleModal";
import { useScheduledTasks } from "@/hooks/useScheduledTasks";
import { useSectionSearchFocus } from "@/hooks/useSectionSearchFocus";
import { createManualControlLog, type ControlDevice, type ScheduledTask } from "@/lib/taskScheduleService";

interface ControlLog {
  id: string;
  text_ar: string;
  text_en: string;
  time: string;
  type: "manual" | "feeder" | "schedule";
}

const defaultDevices: ControlDevice[] = [
  { id: "1", name_ar: "بدالة رقم 01 - حوض أ", name_en: "Aerator #01 - Pond A", type: "aerator", active: true, consumption: "1.2 kW" },
  { id: "2", name_ar: "بدالة رقم 02 - حوض ب", name_en: "Aerator #02 - Pond B", type: "aerator", active: false, consumption: "0 kW" },
  { id: "3", name_ar: "مضخة التدوير المركزية", name_en: "Central Circulation Pump", type: "pump", active: true, consumption: "" },
  { id: "4", name_ar: "مضخة الصرف - قطاع 2", name_en: "Drain Pump - Sector 2", type: "pump", active: false, consumption: "" },
];

const feederUnits = [
  { id: "pond_a", name_ar: "وحدة حوض أ", name_en: "Pond A Unit", load: 85, lastFeedAr: "آخر تغذية: قبل ساعتين", lastFeedEn: "Last fed: 2 hours ago" },
  { id: "pond_b", name_ar: "وحدة حوض ب", name_en: "Pond B Unit", load: 12, lastFeedAr: "مستوى منخفض!", lastFeedEn: "Low level!" },
  { id: "pond_c", name_ar: "وحدة حوض ج", name_en: "Pond C Unit", load: 94, lastFeedAr: "آخر تغذية: قبل 30 دقيقة", lastFeedEn: "Last fed: 30 min ago" },
];

export default function ControlPage() {
  const { t, lang } = useApp();
  const searchParams = useSearchParams();
  const [devices, setDevices] = useState<ControlDevice[]>([]);
  const [logs, setLogs] = useState<ControlLog[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);

  const { tasks, loading, saving, runningTaskId, mutatingTaskId, error, saveTask, runTaskNow, removeTask, setTaskEnabled, clearError } =
    useScheduledTasks(devices);
  const { registerSectionRef, getSectionHighlightClass } = useSectionSearchFocus(searchParams, [
    "aeration",
    "pumps",
    "feeding",
    "schedule",
    "logs",
  ]);

  useEffect(() => {
    const devicesRef = ref(database, "control/devices");
    const logsRef = ref(database, "control/logs");

    const unsubDevices = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const nextDevices = Object.values(data) as ControlDevice[];
        setDevices(nextDevices.sort((a, b) => a.id.localeCompare(b.id)));
      } else {
        void set(
          devicesRef,
          defaultDevices.reduce<Record<string, ControlDevice>>((acc, device) => {
            acc[device.id] = device;
            return acc;
          }, {}),
        );
        setDevices(defaultDevices);
      }
      setLoadingDevices(false);
    });

    const unsubLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLogs([]);
        return;
      }

      const nextLogs = Object.entries(data)
        .map(([id, value]) => ({ id, ...(value as Omit<ControlLog, "id">) }))
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

      setLogs(nextLogs);
    });

    return () => {
      unsubDevices();
      unsubLogs();
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
    }
  }, [error]);

  const sortedTasks = useMemo(() => tasks.slice().sort((a, b) => a.time.localeCompare(b.time)), [tasks]);

  const toggleDevice = async (device: ControlDevice) => {
    setPendingDeviceId(device.id);
    clearError();
    try {
      const nextStatus = !device.active;
      await update(ref(database, `control/devices/${device.id}`), { active: nextStatus });
      await createManualControlLog(
        `${nextStatus ? "تم تشغيل" : "تم إيقاف"} ${device.name_ar} يدويًا`,
        `${device.name_en} ${nextStatus ? "started" : "stopped"} manually`,
        "manual",
      );
      setToastMessage(
        t(
          `${nextStatus ? "تم تشغيل" : "تم إيقاف"} ${device.name_ar}`,
          `${device.name_en} ${nextStatus ? "started" : "stopped"}`,
        ),
      );
    } finally {
      setPendingDeviceId(null);
    }
  };

  const feedNow = async (feederAr: string, feederEn: string) => {
    setToastMessage(t(`جاري تغذية ${feederAr}...`, `Feeding ${feederEn}...`));
    await createManualControlLog(`تمت تغذية ${feederAr} يدويًا`, `${feederEn} fed manually`, "feeder");
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleRunTask = async (task: ScheduledTask) => {
    const success = await runTaskNow(task);
    if (success) {
      setToastMessage(t("تم تنفيذ المهمة بنجاح", "Task executed successfully"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await removeTask(taskId);
    if (success) {
      setToastMessage(t("تم حذف المهمة", "Task deleted"));
    }
  };

  const handleToggleTask = async (task: ScheduledTask) => {
    const success = await setTaskEnabled(task.id, !task.isEnabled);
    if (success) {
      setToastMessage(t(task.isEnabled ? "تم إيقاف المهمة" : "تم تفعيل المهمة", task.isEnabled ? "Task paused" : "Task activated"));
    }
  };

  const formatAbsoluteTime = (time: string) => {
    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const periodAr = hour >= 12 ? "م" : "ص";
    const hour12 = hour % 12 || 12;
    return lang === "ar" ? `${hour12.toString().padStart(2, "0")}:${minute} ${periodAr}` : `${hour.toString().padStart(2, "0")}:${minute}`;
  };

  const formatRelativeExecution = (lastExecutedAt?: string | null) => {
    if (!lastExecutedAt) return t("جاهزة للتنفيذ القادم", "Ready for next execution");

    const diffMinutes = Math.floor((Date.now() - new Date(lastExecutedAt).getTime()) / 60000);
    if (diffMinutes < 1) return t("تم التنفيذ الآن", "Executed just now");
    if (diffMinutes < 60) return t(`منذ ${diffMinutes} دقيقة`, `${diffMinutes} min ago`);
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
    }

    return t(`آخر تنفيذ: ${new Date(lastExecutedAt).toLocaleDateString("ar-EG")} ${new Date(lastExecutedAt).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}`, `Last run: ${new Date(lastExecutedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`);
  };

  const formatLogTime = (time: string) =>
    new Date(time).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const taskStatusChip = (task: ScheduledTask) => {
    const map = {
      ready: { ar: "جاهزة", en: "Ready", className: "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]" },
      executed: { ar: "تم التنفيذ", en: "Executed", className: "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]" },
      active: { ar: "مفعلة", en: "Active", className: "bg-[#10b981]/10 text-[#10b981]" },
      paused: { ar: "متوقفة", en: "Paused", className: "bg-[#f59e0b]/10 text-[#f59e0b]" },
      failed: { ar: "فشل التنفيذ", en: "Failed", className: "bg-[#ef4444]/10 text-[#ef4444]" },
    } as const;
    const key = task.status || (task.isEnabled ? "active" : "paused");
    const status = map[key];

    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${status.className}`}>{t(status.ar, status.en)}</span>;
  };

  const dayLabelMap = {
    sun: { ar: "س", en: "S" },
    mon: { ar: "ن", en: "M" },
    tue: { ar: "ث", en: "T" },
    wed: { ar: "ت", en: "W" },
    thu: { ar: "خ", en: "T" },
    fri: { ar: "ج", en: "F" },
    sat: { ar: "ح", en: "S" },
  } as const;

  if (loadingDevices || loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[var(--color-cyan)] animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-cyan)] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
            {toastMessage}
          </div>
        )}

        <MotionCard className="card flex items-start gap-3 border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {t("وضع تحكم متصل بطبقة Firebase التجريبية", "Control is synced to the Firebase demo layer")}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {t(
                "أي تشغيل أو جدولة هنا يتم مزامنته لحظيًا بين الجلسات وتسجيله في السجل التشغيلي.",
                "Actions here sync across sessions in real time and are saved to the operation log.",
              )}
            </p>
          </div>
        </MotionCard>

        <div ref={registerSectionRef("aeration")} className={getSectionHighlightClass("aeration")}>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-[var(--color-cyan)]" />
            {t("بدالات الأكسجين المذاب (DO) (Aerators)", "Dissolved Oxygen (DO) Aerators")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.filter((device) => device.type === "aerator").map((device) => (
              <MotionCard key={device.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => void toggleDevice(device)}
                    disabled={pendingDeviceId === device.id}
                    className={`w-12 h-6 rounded-full relative transition-colors ${device.active ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"} ${pendingDeviceId === device.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${device.active ? (lang === "ar" ? "right-0.5" : "left-6") : "left-0.5"}`} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t(device.name_ar, device.name_en)}</p>
                      {pendingDeviceId === device.id && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-cyan)]" />}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {device.active ? t(`متصل • استهلاك ${device.consumption}`, `Connected • ${device.consumption}`) : t("منقطع", "Disconnected")}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${device.active ? "bg-[#10b981]" : "bg-[var(--color-text-muted)]"}`} />
              </MotionCard>
            ))}
          </div>
        </div>

        <div ref={registerSectionRef("pumps")} className={getSectionHighlightClass("pumps")}>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-[#3b82f6]" />
            {t("مضخات المياه (Water Pumps)", "Water Pumps")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.filter((device) => device.type === "pump").map((device) => (
              <MotionCard key={device.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => void toggleDevice(device)}
                    disabled={pendingDeviceId === device.id}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${device.active ? "bg-[#10b981] text-white" : "bg-[var(--color-bg-input)] text-[var(--color-text-muted)]"} ${pendingDeviceId === device.id ? "opacity-50" : ""}`}
                  >
                    {pendingDeviceId === device.id && <Loader2 className="w-3 h-3 animate-spin" />}
                    {device.active ? t("إيقاف", "Stop") : t("تشغيل", "Start")}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t(device.name_ar, device.name_en)}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{device.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${device.active ? "bg-[#10b981]" : "bg-[var(--color-text-muted)]"}`} />
              </MotionCard>
            ))}
          </div>
        </div>

        <div ref={registerSectionRef("feeding")} className={getSectionHighlightClass("feeding")}>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-[#f59e0b]" />
            {t("وحدات التغذية التلقائية", "Auto-Feeding Units")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feederUnits.map((unit) => (
              <MotionCard key={unit.id} className="card text-center">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{t(unit.name_ar, unit.name_en)}</p>
                <div className="relative w-full h-3 bg-[var(--color-bg-input)] rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${unit.load > 50 ? "bg-[var(--color-cyan)]" : unit.load > 20 ? "bg-[#f59e0b]" : "bg-[#ef4444]"}`} style={{ width: `${unit.load}%` }} />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t("الحمولة", "Load")}: {unit.load}%
                </p>
                <button onClick={() => void feedNow(unit.name_ar, unit.name_en)} className="btn-primary w-full mt-3 text-xs py-2">
                  {t("غذّ الآن", "Feed Now")}
                </button>
                <p className={`text-[10px] mt-2 ${unit.load < 20 ? "text-[#ef4444]" : "text-[var(--color-text-muted)]"}`}>{t(unit.lastFeedAr, unit.lastFeedEn)}</p>
              </MotionCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div ref={registerSectionRef("schedule")} className={`card ${getSectionHighlightClass("schedule")}`}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleOpenCreate}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                title={t("إضافة مهمة جديدة", "Add a new task")}
              >
                <Plus className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3b82f6]" />
                {t("جدولة المهام", "Task Scheduling")}
              </h3>
            </div>

            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const isRunning = runningTaskId === task.id;
                const isMutating = mutatingTaskId === task.id;

                return (
                  <div key={task.id} className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {taskStatusChip(task)}
                        {task.isEnabled ? (
                          <span className="text-[10px] text-[#10b981] font-semibold">{t("مفعلة", "Enabled")}</span>
                        ) : (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">{t("متوقفة", "Paused")}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{formatAbsoluteTime(task.time)}</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge-safe">{t(task.label_ar, task.label_en)}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">{t(task.desc_ar, task.desc_en)}</p>
                        {task.notes ? <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{task.notes}</p> : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-secondary)] flex items-center justify-center transition-colors"
                          title={t("تعديل", "Edit")}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => void handleToggleTask(task)}
                          disabled={isMutating}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-secondary)] flex items-center justify-center transition-colors disabled:opacity-50"
                          title={t("تفعيل أو إيقاف", "Enable or pause")}
                        >
                          {isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => void handleDeleteTask(task.id)}
                          disabled={isMutating}
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-card)] hover:bg-red-500/10 text-[var(--color-text-secondary)] hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          title={t("حذف", "Delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {task.selectedDays.length > 0 && (
                      <div className={`flex gap-1 mt-2 ${lang === "ar" ? "justify-end" : "justify-start"}`}>
                        {task.selectedDays.map((day) => (
                          <span key={`${task.id}_${day}`} className="w-6 h-6 rounded text-[10px] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] flex items-center justify-center font-semibold">
                            {t(dayLabelMap[day].ar, dayLabelMap[day].en)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 gap-3">
                      <p className="text-[10px] text-[var(--color-text-muted)]">{formatRelativeExecution(task.lastExecutedAt)}</p>
                      <button
                        onClick={() => void handleRunTask(task)}
                        disabled={isRunning || !task.isEnabled}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isRunning || !task.isEnabled ? "bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] cursor-not-allowed" : "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20"}`}
                      >
                        {isRunning ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t("جارٍ التنفيذ", "Running")}
                          </span>
                        ) : (
                          t("تشغيل الآن", "Run now")
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {sortedTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-input)]/60 px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                  {t("لا توجد مهام مجدولة بعد", "No scheduled tasks yet")}
                </div>
              )}
            </div>
          </div>

          <div ref={registerSectionRef("logs")} className={`card ${getSectionHighlightClass("logs")}`}>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
              {t("سجل العمليات", "Operation Log")}
            </h3>
            <div className="space-y-3">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === "schedule" ? "bg-[var(--color-cyan)]" : log.type === "feeder" ? "bg-[#10b981]" : "bg-[#3b82f6]"}`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{t(log.text_ar, log.text_en)}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {formatLogTime(log.time)} • {log.type === "schedule" ? t("مؤتمت", "Automated") : log.type === "feeder" ? t("تغذية", "Feeding") : t("يدوي", "Manual")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">{t("لا توجد سجلات حالياً", "No logs currently")}</p>
              )}
            </div>
          </div>
        </div>

        <TaskScheduleModal
          isOpen={modalOpen}
          saving={saving}
          initialTask={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
        />
      </div>
    </PageTransition>
  );
}
