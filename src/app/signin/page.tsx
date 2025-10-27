'use client';

import { authClient } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function SignUp() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
    });

    redirect('/dashboard');
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}
