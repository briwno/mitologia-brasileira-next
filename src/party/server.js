import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase (opcional, se quisermos persistir)
// const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

const Server = {
  async onConnect(conn, room) {
    console.log(`[PartyKit] Conexão estabelecida: ${conn.id} na sala ${room.id}`);

    // Notificar contagem de conexões
    const connections = [...room.getConnections()];
    room.broadcast(JSON.stringify({
      type: 'PRESENCE_UPDATE',
      payload: { count: connections.length, connectionIds: connections.map(c => c.id) }
    }));

    // Recuperar estado atual da sala (se houver)
    const state = await room.storage.get("matchState");
    
    if (state) {
      conn.send(JSON.stringify({
        type: 'SYNC_STATE',
        payload: state
      }));
    }
  },

  async onMessage(message, conn, room) {
    const data = JSON.parse(message);
    console.log(`[PartyKit] Mensagem recebida na sala ${room.id}:`, data.type);

    // Recuperar estado atual
    let state = await room.storage.get("matchState") || {};

    switch (data.type) {
      case 'IDENTIFY':
        // Jogador se identificando
        // data.payload = { userId: '...' }
        // Podemos armazenar mapeamento conn.id -> userId se necessário
        break;

      case 'INIT_MATCH':
        // Inicializar estado da partida (provavelmente chamado pelo criador ou ao entrar)
        // data.payload = { match: { ... } }
        if (!state.match) {
          state = { match: data.payload };
          await room.storage.put("matchState", state);
          
          room.broadcast(JSON.stringify({
            type: 'SYNC_STATE',
            payload: state
          }));
        }
        break;

      case 'BROADCAST_ACTION':
        // Reencaminhar ação para outros jogadores (exceto o remetente)
        room.broadcast(JSON.stringify({
          type: 'BATTLE_ACTION',
          payload: data.payload
        }), [conn.id]);
        break;

      case 'UPDATE_MATCH_STATE':
        // Atualizar estado da partida (ex: turno, vida, etc)
        // data.payload = { updates: { ... } }
        if (state.match) {
          state.match = { ...state.match, ...data.payload };
          await room.storage.put("matchState", state);
          
          room.broadcast(JSON.stringify({
            type: 'SYNC_STATE',
            payload: state
          }));
        }
        break;

      case 'END_TURN':
        // Lógica específica de fim de turno
        if (state.match) {
          const currentTurn = state.match.current_turn || 1;
          const nextTurn = currentTurn + 1; // Simplificação: incrementa turno
          
          // Alternar jogador (lógica simples, idealmente validaria IDs)
          const playerA = state.match.player_a_id;
          const playerB = state.match.player_b_id;
          const currentPlayer = state.match.current_player_id;
          const nextPlayer = currentPlayer === playerA ? playerB : playerA;

          state.match = {
            ...state.match,
            current_turn: nextTurn, // Nota: na lógica original, turno incrementa quando ambos jogam. Ajustar conforme regra.
            current_player_id: nextPlayer,
            player_a_has_acted: false,
            player_b_has_acted: false,
            last_updated: new Date().toISOString()
          };

          // Se a regra for: turno incrementa só quando volta pro Player A (ou quando ambos agiram)
          // A lógica original do BattleScreen parecia controlar isso. 
          // Por enquanto, vamos confiar no payload enviado pelo cliente ou fazer o servidor ser autoritativo.
          // Para facilitar a migração, vamos aceitar o estado enviado pelo cliente via UPDATE_MATCH_STATE
          // mas se quisermos server-authoritative, implementamos aqui.
          
          // Vou optar por deixar o cliente enviar o UPDATE_MATCH_STATE com o novo turno por enquanto,
          // para não quebrar a lógica complexa do frontend.
          // Então esse case END_TURN pode ser apenas um broadcast ou trigger.
        }
        break;
        
      default:
        console.warn(`[PartyKit] Tipo de mensagem desconhecido: ${data.type}`);
    }
  },

  async onClose(conn, room) {
    console.log(`[PartyKit] Conexão fechada: ${conn.id}`);
    const connections = [...room.getConnections()];
    room.broadcast(JSON.stringify({
      type: 'PRESENCE_UPDATE',
      payload: { count: connections.length, connectionIds: connections.map(c => c.id) }
    }));
  }
};

export default Server;
