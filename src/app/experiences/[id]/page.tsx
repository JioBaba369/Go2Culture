
import { notFound } from "next/navigation";
import { experiences } from "@/lib/data";
import { ExperienceDetailClient } from "@/components/experience-detail-client";

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const experience = experiences.find((exp) => exp.id === params.id);
  
  if (!experience) {
    notFound();
  }

  return <ExperienceDetailClient experience={experience} />;
}
