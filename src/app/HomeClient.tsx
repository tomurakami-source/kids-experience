'use client';

import { useState } from 'react';
import AdventureBook from '@/components/AdventureBook';
import ProfileSelector, { type Profile } from '@/components/ProfileSelector';
import { Quest } from '@/components/questUtils';

const LOCAL_PROFILE: Profile = { id: 'local', name: '', avatar: 'sword', created_at: '' };

interface HomeClientProps {
  initialQuests: Quest[];
  initialProfiles: Profile[];
  localMode?: boolean;
}

export default function HomeClient({ initialQuests, initialProfiles, localMode }: HomeClientProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    localMode ? LOCAL_PROFILE : null,
  );

  if (!selectedProfile) {
    return (
      <ProfileSelector
        initialProfiles={initialProfiles}
        onSelect={setSelectedProfile}
      />
    );
  }

  return (
    <AdventureBook
      quests={initialQuests}
      profile={selectedProfile}
      onBackToProfiles={localMode ? () => {} : () => setSelectedProfile(null)}
    />
  );
}
