import React, { useEffect, useState } from 'react';
import { AppRouter } from '@/router';
import { LocationModal } from '@/components/modals/LocationModal';
import useAuthStore from '@/stores/authStore';

const App: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [showLocation, setShowLocation] = useState(false);

  // Show location modal when user logs in without a location set
  useEffect(() => {
    if (user && !user.location) {
      setShowLocation(true);
    } else {
      setShowLocation(false);
    }
  }, [user?._id, user?.location]);

  return (
    <>
      <AppRouter />
      <LocationModal open={showLocation} onClose={() => setShowLocation(false)} />
    </>
  );
};

export default App;
