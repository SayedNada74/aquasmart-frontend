"use client";

import { useEffect, useState } from "react";
import {
  ControlDevice,
  createScheduledTask,
  deleteScheduledTask,
  runScheduledTask,
  ScheduledTask,
  ScheduledTaskInput,
  subscribeToScheduledTasks,
  toggleScheduledTask,
  updateScheduledTask,
} from "@/lib/taskScheduleService";

export function useScheduledTasks(devices: ControlDevice[]) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [mutatingTaskId, setMutatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToScheduledTasks((nextTasks) => {
      setTasks(nextTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveTask = async (input: ScheduledTaskInput, taskId?: string) => {
    setSaving(true);
    setError(null);
    try {
      if (taskId) {
        await updateScheduledTask(taskId, input);
      } else {
        await createScheduledTask(input);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const runTaskNow = async (task: ScheduledTask) => {
    setRunningTaskId(task.id);
    setError(null);
    try {
      await runScheduledTask(task, devices);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task execution failed");
      return false;
    } finally {
      setRunningTaskId(null);
    }
  };

  const removeTask = async (taskId: string) => {
    setMutatingTaskId(taskId);
    setError(null);
    try {
      await deleteScheduledTask(taskId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task delete failed");
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  };

  const setTaskEnabled = async (taskId: string, nextEnabled: boolean) => {
    setMutatingTaskId(taskId);
    setError(null);
    try {
      await toggleScheduledTask(taskId, nextEnabled);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task update failed");
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  };

  return {
    tasks,
    loading,
    saving,
    runningTaskId,
    mutatingTaskId,
    error,
    saveTask,
    runTaskNow,
    removeTask,
    setTaskEnabled,
    clearError: () => setError(null),
  };
}
