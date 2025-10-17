// src/app/ranking/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaginaRanking() {
const router = useRouter();

useEffect(() => {
router.push('/ranking/top');
}, [router]);

return (
<div className="min-h-screen bg-gradient-to-br from-[#0a1420] via-[#0b1d2e] to-[#07131f] flex items-center justify-center">
<div className="text-white text-center">
<div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
<p>Redirecionando...</p>
</div>
</div>
);
}
