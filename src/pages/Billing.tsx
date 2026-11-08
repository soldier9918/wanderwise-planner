import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BillingHistory from "@/components/BillingHistory";
import TopUpSettings from "@/components/TopUpSettings";

export default function Billing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-12">
        <h1 className="text-4xl font-extrabold">Billing</h1>
        <BillingHistory part="summary" />
        <TopUpSettings />
        <BillingHistory />
      </main>
      <SiteFooter />
    </div>
  );
}