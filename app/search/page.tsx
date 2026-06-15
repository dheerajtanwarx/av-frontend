import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";
import SearchView from "../components/search/SearchView";
import { SearchPageSkeleton } from "../components/skeletons";

export const metadata: Metadata = {
  title: "Search — AV Creation",
  description:
    "Search the full AV Creation collection by name, fabric, craft and category — handcrafted in Jaipur, Rajasthan.",
};

export default function SearchPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />
      <Suspense fallback={<SearchPageSkeleton withHeader={false} />}>
        <SearchView />
      </Suspense>
      <Footer />
    </div>
  );
}
