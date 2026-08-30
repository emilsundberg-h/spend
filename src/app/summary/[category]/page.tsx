"use client";

import { use } from "react";
import { CategoryPurchaseList } from "@/components/category-purchase-list";
import { BackLink } from "@/components/ui/back-link";

export default function CategoryDetailPage(props: PageProps<"/summary/[category]">) {
  // Route params come through still percent-encoded (categories contain "/" and "&"),
  // so decode before using the value for display or matching.
  const { category: rawCategory } = use(props.params);
  const category = decodeURIComponent(rawCategory);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/summary" label="← Summering" />
      <div className="mt-5 flex flex-1 flex-col">
        <CategoryPurchaseList category={category} />
      </div>
    </div>
  );
}
