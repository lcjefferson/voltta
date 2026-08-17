"use client";

import { useParams } from "next/navigation";
import { PublicBookingPage } from "@/components/public-booking-page";

export default function ShortBookingRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PublicBookingPage slug={slug} />;
}
