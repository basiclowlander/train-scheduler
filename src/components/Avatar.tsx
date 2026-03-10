import React from 'react';

interface PersonConfig {
  name: string;
  avatar_url: string;
  enabled: boolean;
  order: number;
}

interface SpecialEventConfig {
  name: string;
  avatar_url: string;
  enabled: boolean;
  dayOfWeek: string;
}

interface AvatarProps {
  label: string;
  peopleConfig: PersonConfig[];
  specialEventsConfig: SpecialEventConfig[];
}

function getProxiedUrl(url: string): string {
  const proxy = 'https://proxy.corsfix.com/?';
  if ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes('proxy.corsfix.com')) {
    return `${proxy}${url}`;
  }
  return url;
}

export function Avatar({ label, peopleConfig, specialEventsConfig }: AvatarProps) {
  const person = peopleConfig.find((p) => p.name === label);
  const specialEvent = specialEventsConfig.find((e) => e.name === label);
  let imgSrc = person
    ? person.avatar_url
    : specialEvent
    ? specialEvent.avatar_url
    : null;

  if (imgSrc) {
    imgSrc = getProxiedUrl(imgSrc);
  }

  return (
    <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={label}
          crossOrigin="anonymous"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
