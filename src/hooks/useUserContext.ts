<<<<<<< HEAD
=======

>>>>>>> refs/remotes/origin/main
import { useContext } from 'react';
import { UserContext } from '@/contexts/UserContext';

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
<<<<<<< HEAD
};
=======
};
>>>>>>> refs/remotes/origin/main
