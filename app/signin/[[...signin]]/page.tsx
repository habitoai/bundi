import { SignIn } from "@clerk/nextjs";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bundi - Sign In',
};

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </div>
  );
}
