import { ApplicationDetailClient } from '@/components/admin/application-detail-client';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return <ApplicationDetailClient applicationId={params.id} />;
}
