import { database } from "@/lib/firebase";
import { onValue, push, ref, remove, set, update } from "firebase/database";

export type ScheduledTaskType = "feeding" | "aeration" | "pump_on" | "pump_off" | "night_mode";
export type ScheduledTaskScope = "all" | "pond_a" | "pond_b" | "pond_c";
export type ScheduledTaskStatus = "ready" | "executed" | "active" | "paused" | "failed";
export type ScheduledDayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface ControlDevice {
  id: string;
  name_ar: string;
  name_en: string;
  type: "aerator" | "pump" | "feeder";
  active: boolean;
  consumption: string;
}

export interface ScheduledTask {
  id: string;
  type: ScheduledTaskType;
  label_ar: string;
  label_en: string;
  desc_ar: string;
  desc_en: string;
  time: string;
  selectedDays: ScheduledDayKey[];
  scope: ScheduledTaskScope;
  status: ScheduledTaskStatus;
  isEnabled: boolean;
  durationMinutes?: number | null;
  notes?: string;
  lastExecutedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTaskInput {
  type: ScheduledTaskType;
  time: string;
  selectedDays: ScheduledDayKey[];
  scope: ScheduledTaskScope;
  durationMinutes?: number | null;
  notes?: string;
  isEnabled: boolean;
}

const tasksRef = ref(database, "control/tasks");

const pondLabels: Record<ScheduledTaskScope, { ar: string; en: string }> = {
  all: { ar: "كل الأحواض", en: "All ponds" },
  pond_a: { ar: "حوض أ", en: "Pond A" },
  pond_b: { ar: "حوض ب", en: "Pond B" },
  pond_c: { ar: "حوض ج", en: "Pond C" },
};

const defaultTasksSeed: ScheduledTaskInput[] = [
  {
    type: "feeding",
    time: "06:00",
    selectedDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    scope: "all",
    isEnabled: true,
    notes: "",
  },
  {
    type: "aeration",
    time: "20:00",
    selectedDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    scope: "all",
    durationMinutes: 120,
    isEnabled: true,
    notes: "",
  },
];

export function subscribeToScheduledTasks(onChange: (tasks: ScheduledTask[]) => void) {
  return onValue(tasksRef, async (snapshot) => {
    const value = snapshot.val();

    if (!value) {
      await Promise.all(
        defaultTasksSeed.map((seed) => {
          const newTaskRef = push(tasksRef);
          return set(newTaskRef, buildTaskPayload(seed));
        }),
      );
      return;
    }

    const tasks = Object.entries(value)
      .map(([id, raw]) => hydrateScheduledTask(id, raw as Partial<ScheduledTask>))
      .sort((a, b) => a.time.localeCompare(b.time));

    onChange(tasks);
  });
}

export async function createScheduledTask(input: ScheduledTaskInput) {
  const newTaskRef = push(tasksRef);
  await set(newTaskRef, buildTaskPayload(input));
  return newTaskRef.key;
}

export async function updateScheduledTask(taskId: string, input: ScheduledTaskInput) {
  const now = new Date().toISOString();
  const payload = buildTaskPayload(input);
  await update(ref(database, `control/tasks/${taskId}`), {
    ...payload,
    updatedAt: now,
  });
}

export async function deleteScheduledTask(taskId: string) {
  await remove(ref(database, `control/tasks/${taskId}`));
}

export async function toggleScheduledTask(taskId: string, nextEnabled: boolean) {
  await update(ref(database, `control/tasks/${taskId}`), {
    isEnabled: nextEnabled,
    status: nextEnabled ? "active" : "paused",
    updatedAt: new Date().toISOString(),
  });
}

export async function runScheduledTask(task: ScheduledTask, devices: ControlDevice[]) {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    [`control/tasks/${task.id}/lastExecutedAt`]: now,
    [`control/tasks/${task.id}/updatedAt`]: now,
    [`control/tasks/${task.id}/status`]: "executed",
  };

  const logEntries = createTaskExecutionLogs(task, devices);
  logEntries.forEach((entry) => {
    updates[`control/logs/${entry.id}`] = entry.payload;
  });

  if (task.type === "aeration") {
    resolveAerationTargets(task.scope, devices).forEach((device) => {
      updates[`control/devices/${device.id}/active`] = true;
    });
  }

  if (task.type === "pump_on" || task.type === "pump_off") {
    devices
      .filter((device) => device.type === "pump")
      .forEach((device) => {
        updates[`control/devices/${device.id}/active`] = task.type === "pump_on";
      });
  }

  await update(ref(database), updates);
}

export async function createManualControlLog(textAr: string, textEn: string, type: "manual" | "feeder" | "schedule") {
  const entry = createLogEntry(textAr, textEn, type);
  await set(ref(database, `control/logs/${entry.id}`), entry.payload);
}

export function createTaskLabels(input: Pick<ScheduledTaskInput, "type" | "scope" | "durationMinutes">) {
  if (input.type === "feeding") {
    return {
      label_ar: "تغذية",
      label_en: "Feeding",
      desc_ar: `تغذية مجدولة - ${pondLabels[input.scope].ar}`,
      desc_en: `Scheduled feeding - ${pondLabels[input.scope].en}`,
    };
  }

  if (input.type === "aeration") {
    const durationAr = input.durationMinutes ? ` لمدة ${input.durationMinutes} دقيقة` : "";
    const durationEn = input.durationMinutes ? ` for ${input.durationMinutes} minutes` : "";
    return {
      label_ar: "تهوية",
      label_en: "Aeration",
      desc_ar: `تشغيل البدالات - ${pondLabels[input.scope].ar}${durationAr}`,
      desc_en: `Aeration run - ${pondLabels[input.scope].en}${durationEn}`,
    };
  }

  return {
    label_ar: "مهمة تحكم",
    label_en: "Control Task",
    desc_ar: `إجراء ذكي - ${pondLabels[input.scope].ar}`,
    desc_en: `Smart action - ${pondLabels[input.scope].en}`,
  };
}

function buildTaskPayload(input: ScheduledTaskInput): Omit<ScheduledTask, "id"> {
  const now = new Date().toISOString();
  const labels = createTaskLabels(input);

  return {
    type: input.type,
    label_ar: labels.label_ar,
    label_en: labels.label_en,
    desc_ar: labels.desc_ar,
    desc_en: labels.desc_en,
    time: input.time,
    selectedDays: input.selectedDays,
    scope: input.scope,
    status: input.isEnabled ? "active" : "paused",
    isEnabled: input.isEnabled,
    durationMinutes: input.durationMinutes ?? null,
    notes: input.notes?.trim() || "",
    lastExecutedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function hydrateScheduledTask(id: string, raw: Partial<ScheduledTask>): ScheduledTask {
  const normalizedInput: ScheduledTaskInput = {
    type: raw.type || "feeding",
    time: raw.time || "06:00",
    selectedDays: Array.isArray(raw.selectedDays) ? raw.selectedDays : [],
    scope: raw.scope || "all",
    durationMinutes: raw.durationMinutes ?? null,
    notes: raw.notes || "",
    isEnabled: raw.isEnabled ?? true,
  };
  const labels = createTaskLabels(normalizedInput);

  return {
    id,
    type: normalizedInput.type,
    label_ar: raw.label_ar || labels.label_ar,
    label_en: raw.label_en || labels.label_en,
    desc_ar: raw.desc_ar || labels.desc_ar,
    desc_en: raw.desc_en || labels.desc_en,
    time: normalizedInput.time,
    selectedDays: normalizedInput.selectedDays,
    scope: normalizedInput.scope,
    status: raw.status || (normalizedInput.isEnabled ? "active" : "paused"),
    isEnabled: normalizedInput.isEnabled,
    durationMinutes: normalizedInput.durationMinutes,
    notes: normalizedInput.notes,
    lastExecutedAt: raw.lastExecutedAt || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

function createTaskExecutionLogs(task: ScheduledTask, devices: ControlDevice[]) {
  if (task.type === "feeding") {
    const targets = task.scope === "all" ? ["حوض أ", "حوض ب", "حوض ج"] : [pondLabels[task.scope].ar];
    const targetsEn = task.scope === "all" ? ["Pond A", "Pond B", "Pond C"] : [pondLabels[task.scope].en];
    return targets.map((target, index) =>
      createLogEntry(
        `تم تنفيذ مهمة تغذية ${target} تلقائيًا`,
        `Feeding task executed for ${targetsEn[index]}`,
        "schedule",
        `${index}`,
      ),
    );
  }

  if (task.type === "aeration") {
    const targets = resolveAerationTargets(task.scope, devices);
    const labelAr = targets.length ? targets.map((device) => device.name_ar).join("، ") : pondLabels.all.ar;
    const labelEn = targets.length ? targets.map((device) => device.name_en).join(", ") : pondLabels.all.en;
    return [createLogEntry(`تم تشغيل مهمة التهوية لـ ${labelAr}`, `Aeration task executed for ${labelEn}`, "schedule")];
  }

  return [createLogEntry("تم تنفيذ مهمة تحكم مجدولة", "Scheduled control task executed", "schedule")];
}

function resolveAerationTargets(scope: ScheduledTaskScope, devices: ControlDevice[]) {
  const aerators = devices.filter((device) => device.type === "aerator");
  if (scope === "all" || scope === "pond_c") return aerators;
  if (scope === "pond_a") return aerators.filter((device) => device.id === "1");
  if (scope === "pond_b") return aerators.filter((device) => device.id === "2");
  return aerators;
}

function createLogEntry(textAr: string, textEn: string, type: "manual" | "feeder" | "schedule", suffix?: string) {
  const id = `${Date.now()}_${suffix || Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    payload: {
      text_ar: textAr,
      text_en: textEn,
      time: new Date().toISOString(),
      type,
    },
  };
}
