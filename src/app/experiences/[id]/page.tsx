
import { ExperienceDetailClient } from "@/components/experience-detail-client";

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  // The client component will fetch all necessary data based on the ID.
  return <ExperienceDetailClient experienceId={params.id} />;
}
