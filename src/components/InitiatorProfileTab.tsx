import { InitiatorProfile } from '../utils/profiles';
import ProfileCard from './ProfileCard';

interface InitiatorProfileTabProps {
  initiators: InitiatorProfile[];
  selectedInitiatorId: string;
  onSelectInitiator: (id: string) => void;
}

export default function InitiatorProfileTab({
  initiators,
  selectedInitiatorId,
  onSelectInitiator,
}: InitiatorProfileTabProps) {
  const selectedInitiator = initiators.find((i) => i.id === selectedInitiatorId) || initiators[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-5xl mx-auto">
      <div className="w-full lg:w-80 flex-shrink-0">
        <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider mb-3">Female Users</h3>
        <div className="space-y-2">
          {initiators.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectInitiator(user.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                selectedInitiatorId === user.id
                  ? 'bg-bumble-gold/20 border-2 border-bumble-gold shadow-md'
                  : 'bg-white border-2 border-transparent hover:border-bumble-gold/30 shadow hover:shadow-md'
              }`}
            >
              <img
                src={user.photo}
                alt={user.name}
                className="w-14 h-14 rounded-xl object-cover object-top flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-black text-bumble-dark">{user.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">Age {user.age}</div>
                <div className="text-xs text-bumble-gold font-semibold mt-1">Conv. Rate: {(user.features.init_prior_conv_rate * 100).toFixed(0)}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:flex-1">
        <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider mb-3">Profile Details</h3>
        <ProfileCard profile={selectedInitiator} isInitiator={true} />
      </div>
    </div>
  );
}
