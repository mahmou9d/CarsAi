"use client";

import { MonthlyGrowthChart } from "../widgets/growth-chart";
import { TopDemandedInventoryCard } from "../widgets/top-demanded-cars";
import { WishlistDemandWidget } from "../widgets/wishlist-demand";

export function TrendsTab({ monthlyTrends, topDemandedCars, wishlistDemand }) {
  return (
    <div className="space-y-5">
      <MonthlyGrowthChart trends={monthlyTrends} />

      <div className="grid gap-5 md:grid-cols-2">
        <TopDemandedInventoryCard cars={topDemandedCars} />
        <WishlistDemandWidget wishlist={wishlistDemand} />
      </div>
    </div>
  );
}

