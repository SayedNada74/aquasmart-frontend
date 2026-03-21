"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  ScheduledDayKey,
  ScheduledTask,
  ScheduledTaskInput,
  ScheduledTaskScope,
  ScheduledTaskType,
} from "@/lib/taskScheduleService";
import { useApp } from "@/lib/AppContext";

interface TaskScheduleModalProps {
  isOpen: boolean;
  saving: boolean;
  initialTask?: ScheduledTask | null;
  onClose: () => void;
  onSave: (input: ScheduledTaskInput, taskId?: string) => Promise<boolean>;
}

const dayOrder: ScheduledDayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function TaskScheduleModal({ isOpen, saving, initialTask, onClose, onSave }: TaskScheduleModalProps) {
  const { t, lang } = useApp();
  const [taskType, setTaskType] = useState<ScheduledTaskType>("feeding");
  const [time, setTime] = useState("06:00");
  const [scope, setScope] = useState<ScheduledTaskScope>("all");
  const [selectedDays, setSelectedDays] = useState<ScheduledDayKey[]>([]);
  const [durationMinutes, setDurationMinutes] = useState("120");
  const [notes, setNotes] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (initialTask) {
      setTaskType(initialTask.type);
      setTime(initialTask.time);
      setScope(initialTask.scope);
      setSelectedDays(initialTask.selectedDays);
      setDurationMinutes(initialTask.durationMinutes ? String(initialTask.durationMinutes) : "120");
      setNotes(initialTask.notes || "");
      setIsEnabled(initialTask.isEnabled);
      setError("");
      return;
    }

    setTaskType("feeding");
    setTime("06:00");
    setScope("all");
    setSelectedDays([]);
    setDurationMinutes("120");
    setNotes("");
    setIsEnabled(true);
    setError("");
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const dayLabels: Record<ScheduledDayKey, { ar: string; en: string }> = {
    sun: { ar: "س", en: "S" },
    mon: { ar: "ن", en: "M" },
    tue: { ar: "ث", en: "T" },
    wed: { ar: "ت", en: "W" },
    thu: { ar: "خ", en: "T" },
    fri: { ar: "ج", en: "F" },
    sat: { ar: "ح", en: "S" },
  };

  const scopeOptions =
    taskType === "aeration"
      ? [
          { value: "all" as const, labelAr: "كل الأحواض", labelEn: "All ponds" },
          { value: "pond_a" as const, labelAr: "حوض أ", labelEn: "Pond A" },
          { value: "pond_b" as const, labelAr: "حوض ب", labelEn: "Pond B" },
        ]
      : [
          { value: "all" as const, labelAr: "كل الأحواض", labelEn: "All ponds" },
          { value: "pond_a" as const, labelAr: "حوض أ", labelEn: "Pond A" },
          { value: "pond_b" as const, labelAr: "حوض ب", labelEn: "Pond B" },
          { value: "pond_c" as const, labelAr: "حوض ج", labelEn: "Pond C" },
        ];

  const toggleDay = (day: ScheduledDayKey) => {
    setSelectedDays((current) => (current.includes(day) ? current.filter((value) => value !== day) : [...current, day]));
  };

  const handleSave = async () => {
    if (!time) {
      setError(t("حدد وقت التنفيذ", "Select an execution time"));
      return;
    }

    if (selectedDays.length === 0) {
      setError(t("اختر يومًا واحدًا على الأقل", "Select at least one day"));
      return;
    }

    if (taskType === "aeration" && Number(durationMinutes) <= 0) {
      setError(t("مدة التهوية يجب أن تكون أكبر من صفر", "Aeration duration must be greater than zero"));
      return;
    }

    const success = await onSave(
      {
        type: taskType,
        time,
        selectedDays,
        scope,
        durationMinutes: taskType === "aeration" ? Number(durationMinutes) : null,
        notes,
        isEnabled,
      },
      initialTask?.id,
    );

    if (success) {
      onClose();
    } else {
      setError(t("تعذر حفظ المهمة. حاول مرة أخرى.", "Failed to save the task. Please try again."));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              {initialTask ? t("تعديل مهمة مجدولة", "Edit Scheduled Task") : t("إضافة مهمة مجدولة", "Add Scheduled Task")}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {t("أنشئ مهمة تحكم حقيقية مرتبطة بالنظام الحالي", "Create a real control task linked to the current system")}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card-hover)] transition-colors flex items-center justify-center text-[var(--color-text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("نوع المهمة", "Task Type")}</span>
              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value as ScheduledTaskType)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
              >
                <option value="feeding">{t("تغذية", "Feeding")}</option>
                <option value="aeration">{t("تهوية", "Aeration")}</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("وقت التنفيذ", "Execution Time")}</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("الأيام", "Days")}</span>
            <div className={`flex flex-wrap gap-2 ${lang === "ar" ? "justify-end" : "justify-start"}`}>
              {dayOrder.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[var(--color-cyan)] text-white border-[var(--color-cyan)] shadow-lg shadow-[var(--color-cyan)]/20"
                        : "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-cyan)]/40"
                    }`}
                  >
                    {t(dayLabels[day].ar, dayLabels[day].en)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("نطاق التنفيذ", "Execution Scope")}</span>
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as ScheduledTaskScope)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
              >
                {scopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelAr, option.labelEn)}
                  </option>
                ))}
              </select>
            </label>

            {taskType === "aeration" ? (
              <label className="space-y-2">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("مدة التشغيل (دقيقة)", "Run Duration (Minutes)")}</span>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
                />
              </label>
            ) : (
              <label className="space-y-2">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("ملاحظات", "Notes")}</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("اختياري", "Optional")}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
                />
              </label>
            )}
          </div>

          {taskType === "aeration" && (
            <label className="space-y-2 block">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t("ملاحظات", "Notes")}</span>
              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("مثال: وضع ليلي هادئ", "Example: quiet night mode")}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-cyan)]"
              />
            </label>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-input)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t("تفعيل المهمة", "Task Activation")}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{t("يمكن إيقافها لاحقًا من الجدول", "You can pause it later from the schedule list")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEnabled((current) => !current)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isEnabled ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isEnabled ? (lang === "ar" ? "right-0.5" : "left-6") : "left-0.5"}`}
              />
            </button>
          </div>

          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        </div>

        <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3 bg-[var(--color-bg-card)]/80 backdrop-blur">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">
            {t("إلغاء", "Cancel")}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("جارٍ الحفظ", "Saving")}
              </span>
            ) : initialTask ? (
              t("حفظ التعديلات", "Save Changes")
            ) : (
              t("إضافة المهمة", "Add Task")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
