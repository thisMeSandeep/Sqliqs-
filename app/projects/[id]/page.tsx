import { ProjectWorkspace } from "@/components/project/project-workspace";

// Auth-gated (proxy.ts protects /projects). The project itself is loaded
// client-side from IndexedDB by id.
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectWorkspace id={id} />;
}
