import type { LightItUpProjectFile } from "./projectSerializer";

const STORAGE_KEY = "light-it-up:recent-projects:v1";
const MAX_RECENT_PROJECTS = 3;

export type RecentProject = {
  id: string;
  name: string;
  updatedAt: string;
  snapshot: LightItUpProjectFile;
};

const isRecentProject = (value: unknown): value is RecentProject => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<RecentProject>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.snapshot === "object" &&
    candidate.snapshot !== null
  );
};

export const getRecentProjects = (): RecentProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentProject)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, MAX_RECENT_PROJECTS);
  } catch {
    return [];
  }
};

export const rememberRecentProject = (
  snapshot: LightItUpProjectFile
): RecentProject[] => {
  const entry: RecentProject = {
    id: snapshot.project.id,
    name: snapshot.project.name || "Proyecto sin título",
    updatedAt: snapshot.project.updatedAt,
    snapshot,
  };

  const next = [
    entry,
    ...getRecentProjects().filter((project) => project.id !== entry.id),
  ].slice(0, MAX_RECENT_PROJECTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("No se pudo guardar la lista de proyectos recientes.", error);
  }

  return next;
};

export const removeRecentProject = (id: string): RecentProject[] => {
  const next = getRecentProjects().filter((project) => project.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // La lista reciente es una ayuda; un fallo de almacenamiento no bloquea la app.
  }
  return next;
};
