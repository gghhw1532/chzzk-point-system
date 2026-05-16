"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, Trophy, User, Vote } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/shop", label: "상점", icon: Gift },
  { href: "/predictions", label: "예측", icon: Vote },
  { href: "/ranking", label: "랭킹", icon: Trophy },
  { href: "/me", label: "내정보", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 text-xs ${
                active ? "text-black" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}