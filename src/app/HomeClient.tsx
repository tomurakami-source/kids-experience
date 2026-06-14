'use client';

import { useState, useEffect } from 'react';
import AdventureBook from '@/components/AdventureBook';
import ProfileSelector, { type Profile } from '@/components/ProfileSelector';
import ConsentScreen, { hasConsented } from '@/components/ConsentScreen';
import { Quest } from '@/components/questUtils';

const LOCAL_PROFILE: Profile = { id: 'local', name: '', avatar: 'sword', created_at: '' };

interface HomeClientProps {
  initialQuests: Quest[];
  initialProfiles: Profile[];
  localMode?: boolean;
}

export default function HomeClient({ initialQuests, initialProfiles, localMode }: HomeClientProps) {
  const [consented, setConsented] = useState(true); // true で初期化してフラッシュ防止
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    localMode ? LOCAL_PROFILE : null,
  );

  useEffect(() => {
    setConsented(hasConsented());
  }, []);

  if (!consented) {
    return <ConsentScreen onConsent={() => setConsented(true)} />;
  }

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
