"use client";

import AccountSubShell from "../../components/profile/AccountSubShell";
import AddressBook from "../../components/profile/AddressBook";
import { AddressBookSkeleton } from "../../components/skeletons";

export default function AddressesPage() {
  return (
    <AccountSubShell
      title="Addresses"
      subtitle="Saved delivery addresses for faster checkout"
      skeleton={<AddressBookSkeleton />}
    >
      {() => <AddressBook />}
    </AccountSubShell>
  );
}
