import { useState, useMemo } from 'react';
import { ViewTab, Profile } from '../types';
import { rankProfiles } from '../utils/cilModel';
import { INITIATORS, RAW_PROFILES } from '../utils/profiles';
import Header from '../components/Header';
import InitiatorProfileTab from '../components/InitiatorProfileTab';
import RankedMatches from '../components/RankedMatches';
import MatchProfileTab from '../components/MatchProfileTab';
import SettingsModal from '../components/SettingsModal';

export default function Index() {
  const [activeTab, setActiveTab] = useState<ViewTab>('initiator');
  const [selectedInitiatorId, setSelectedInitiatorId] = useState<string>('u1');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('p1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const selectedInitiator = useMemo(
    () => INITIATORS.find((i) => i.id === selectedInitiatorId) || INITIATORS[0],
    [selectedInitiatorId]
  );

  const rankedProfiles = useMemo(() => {
    const profilesWithInitiator = RAW_PROFILES.map(
      (p) =>
        ({
          ...p,
          initiator: selectedInitiator.features,
        }) as Profile
    );
    return rankProfiles(profilesWithInitiator);
  }, [selectedInitiator]);

  const selectedProfile = useMemo(
    () =>
      rankedProfiles.find((p) => p.id === selectedCandidateId) ?? rankedProfiles[0],
    [rankedProfiles, selectedCandidateId]
  );

  function handleSelectCandidate(profile: Profile) {
    setSelectedCandidateId(profile.id);
    setActiveTab('matchProfile');
  }

  function handleSelectInitiator(id: string) {
    setSelectedInitiatorId(id);
    setSelectedCandidateId(rankedProfiles[0]?.id || 'p1');
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="px-4 py-6 max-w-6xl mx-auto">
        {activeTab === 'initiator' && (
          <InitiatorProfileTab
            initiators={INITIATORS}
            selectedInitiatorId={selectedInitiatorId}
            onSelectInitiator={handleSelectInitiator}
          />
        )}

        {activeTab === 'rankings' && (
          <RankedMatches
            profiles={rankedProfiles}
            selectedId={selectedCandidateId}
            onSelect={handleSelectCandidate}
          />
        )}

        {activeTab === 'matchProfile' && (
          <MatchProfileTab profile={selectedProfile} initiator={selectedInitiator} />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <footer className="mt-10 pb-8 text-center text-xs text-gray-400">
        <span className="font-bold text-bumble-dark">bumble</span> CIL Predictor
      </footer>
    </div>
  );
}
