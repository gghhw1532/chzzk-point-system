"use client";

import { useState } from "react";
import AdminPointForm from "@/components/AdminPointForm";
import AdminCreateItemForm from "@/components/AdminCreateItemForm";
import AdminShopItemList from "@/components/AdminShopItemList";
import AdminCreatePredictionForm from "@/components/AdminCreatePredictionForm";
import AdminPredictionList from "@/components/AdminPredictionList";
import AdminSettingsForm from "@/components/AdminSettingsForm";

type User = {
  id: string;
  nickname: string;
  points: number;
};

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
};

type Prediction = {
  id: string;
  title: string;
  status: string;
  prediction_options: {
    id: string;
    title: string;
  }[];
};

type Setting = {
  key: string;
  value: string;
};

type Tab = "points" | "shop" | "predictions" | "settings";

export default function AdminTabs({
  users,
  items,
  predictions,
  settings,
}: {
  users: User[];
  items: Item[];
  predictions: Prediction[];
  settings: Setting[];
}) {
  const [tab, setTab] = useState<Tab>("points");

  const tabs: { id: Tab; label: string }[] = [
    { id: "points", label: "포인트 관리" },
    { id: "shop", label: "상점 관리" },
    { id: "predictions", label: "승부예측" },
    { id: "settings", label: "설정" },
  ];

  return (
    <section className="mt-8 w-full">

      
    </section>
  );
}