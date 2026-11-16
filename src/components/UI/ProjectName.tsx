import { useProjectStore } from "../../store/projectStore";

export default function ProjectName() {
  const { project, renameProject } = useProjectStore();

  return (
    <input
      value={project.name}
      onChange={(e) => renameProject(e.target.value)}
      className="project-name-input"
    />
  );
}