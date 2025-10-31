import { Footer } from "@/components/landing/footer";
import NavFooterLayout from "@/layouts/NavFooterLayout";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <NavFooterLayout>{children}<Footer /></NavFooterLayout>;
}
