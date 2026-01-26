'use client';

interface ExperienceMapProps {
  locationQuery: string;
}

export function ExperienceMap({ locationQuery }: ExperienceMapProps) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    locationQuery
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <iframe
      className="h-full w-full rounded-lg border-0"
      src={mapSrc}
      title="Experience Location"
      aria-label="Map showing approximate location of the experience"
      loading="lazy"
      allowFullScreen
    ></iframe>
  );
}
