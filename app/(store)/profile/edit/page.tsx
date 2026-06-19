"use client";

import AccountSubShell from "../../components/profile/AccountSubShell";
import PersonalDetails from "../../components/profile/PersonalDetails";

export default function EditProfilePage() {
  return (
    <AccountSubShell title="Edit Profile" subtitle="Update your name and contact number">
      {(user, setUser) => <PersonalDetails user={user} onSaved={setUser} />}
    </AccountSubShell>
  );
}
