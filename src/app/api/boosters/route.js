// api das moedas e booster
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    if (!playerId) {
      return NextResponse.json(
        { error: "playerId é obrigatório" },
        { status: 400 }
      );
    }
    // Buscar coins do jogador
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("coins")
      .eq("id", playerId)
      .maybeSingle();
    if (playerError) throw playerError;
    if (!player) {
      return NextResponse.json(
        { error: "Jogador não encontrado" },
        { status: 404 }
      );
    }
    const coins = player.coins || 0;

    return NextResponse.json({ coins });
  } catch (error) {
    console.error("[Boosters] Erro:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
