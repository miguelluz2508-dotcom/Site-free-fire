import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  UserPlus, 
  Heart, 
  Send,
  Smartphone,
  ChevronRight,
  Loader2,
  Zap
} from 'lucide-react';

const CONFIG = {
  tiktokProfile: "https://www.tiktok.com/@strangkingjz7",
  tiktokVideo: "https://vt.tiktok.com/ZSx87JVjV/",
  discord: "https://discord.gg/J4eHt7wBE",
  appId: "strange-system-v1"
};

export default function App() {
  const [view, setView] = useState('missions'); // 'missions' ou 'ai'
  const [missions, setMissions] = useState({
    follow: { status: 'idle', count: 0, required: 1, timer: 0 },
    like: { status: 'idle', count: 0, required: 3, timer: 0 },
    discord: { status: 'idle', count: 0, required: 1, timer: 0 }
  });
  const [isDesbloqueado, setIsDesbloqueado] = useState(false);

  // Lógica do Cronómetro
  useEffect(() => {
    const timer = setInterval(() => {
      setMissions(prev => {
        const next = { ...prev };
        let changed = false;

        ['follow', 'like', 'discord'].forEach(key => {
          if (next[key].timer > 0) {
            next[key].timer -= 1;
            changed = true;
            if (next[key].timer === 0) {
              if (key === 'like' && next[key].count < next[key].required) {
                 next[key].status = 'idle';
              } else {
                 next[key].status = 'completed';
              }
            }
          }
        });

        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Verificar se tudo foi desbloqueado
  useEffect(() => {
    if (missions.follow.status === 'completed' && 
        missions.like.status === 'completed' && 
        missions.discord.status === 'completed') {
      setIsDesbloqueado(true);
    }
  }, [missions]);

  const startMission = (type) => {
    if (missions[type].status === 'completed' || missions[type].status === 'waiting') return;

    // Determinar o URL correto
    let url = "";
    if (type === 'follow') url = CONFIG.tiktokProfile;
    else if (type === 'like') url = CONFIG.tiktokVideo;
    else if (type === 'discord') url = CONFIG.discord;

    // Criar um elemento <a> temporário para abrir o link (mais confiável que window.open)
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Atualizar estado e iniciar timer
    if (type === 'follow') {
      setMissions(prev => ({ ...prev, follow: { ...prev.follow, status: 'waiting', timer: 30 } }));
    } else if (type === 'like') {
      setMissions(prev => ({ 
        ...prev, 
        like: { 
          ...prev.like, 
          count: prev.like.count + 1, 
          status: 'waiting', 
          timer: 15 
        } 
      }));
    } else if (type === 'discord') {
      setMissions(prev => ({ ...prev, discord: { ...prev.discord, status: 'waiting', timer: 5 } }));
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Brilhos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[10%] w-[40%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {view === 'missions' ? (
          <MissionsScreen 
            missions={missions} 
            onStart={startMission} 
            isDesbloqueado={isDesbloqueado}
            onUnlock={() => setView('ai')}
          />
        ) : (
          <AIChatScreen />
        )}
      </main>

      <footer className="fixed bottom-4 w-full text-center text-[10px] text-gray-600 uppercase tracking-widest opacity-50">
        Distribuído por StrangKingiz7 - Tu jogas, nós optimizamos
      </footer>
    </div>
  );
}

// --- ECRÃS ---

function MissionsScreen({ missions, onStart, isDesbloqueado, onUnlock }) {
  const progress = [
    missions.follow.status === 'completed' ? 1 : 0,
    missions.like.status === 'completed' ? 1 : 0,
    missions.discord.status === 'completed' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">Executor <span className="text-purple-500">Strange</span></h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Obter chave de acesso</p>
      </div>

      <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="text-center pb-4 border-b border-white/5">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Conclui as acções e desbloqueia a IA</p>
        </div>

        <div className="space-y-3">
          <MissionButton 
            icon={<UserPlus className="w-5 h-5" />}
            label="SEGUE NO TIKTOK"
            status={missions.follow.status}
            timer={missions.follow.timer}
            onClick={() => onStart('follow')}
          />
          <MissionButton 
            icon={<Heart className="w-5 h-5" />}
            label={`GOSTA DE VÍDEOS (${missions.like.count}/${missions.like.required})`}
            status={missions.like.status}
            timer={missions.like.timer}
            onClick={() => onStart('like')}
          />
          <MissionButton 
            icon={<MessageSquare className="w-5 h-5" />}
            label="ENTRA NO DISCORD"
            status={missions.discord.status}
            timer={missions.discord.timer}
            onClick={() => onStart('discord')}
          />
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center px-2">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progresso: {progress}/3</span>
             <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500" 
                  style={{ width: `${(progress / 3) * 100}%` }}
                />
             </div>
          </div>

          <button 
            disabled={!isDesbloqueado}
            onClick={onUnlock}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-sm tracking-tighter transition-all ${
              isDesbloqueado 
              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-[1.02]' 
              : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
            }`}
          >
            {isDesbloqueado ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            Desbloquear Conteúdo
          </button>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 text-center px-8 leading-relaxed">
        Apoia o criador: o conteúdo é oferecido gratuitamente graças às acções de envolvimento acima.
      </div>
    </div>
  );
}

function MissionButton({ icon, label, status, timer, onClick }) {
  const isCompleted = status === 'completed';
  const isWaiting = status === 'waiting';

  return (
    <button 
      onClick={onClick}
      disabled={isCompleted || isWaiting}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
        isCompleted 
        ? 'bg-green-500/10 border-green-500/30 text-green-500' 
        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 active:scale-95'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={isCompleted ? 'text-green-500' : 'text-purple-500'}>{icon}</div>
        <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
      </div>
      <div className="flex items-center">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isWaiting ? (
          <span className="text-xs font-mono font-bold bg-white/10 px-2 py-1 rounded-md">{timer}s</span>
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </div>
    </button>
  );
}

function AIChatScreen() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "ACESSO LIBERADO! 😈\n\nSou a Strange AI. Manda o modelo do teu telemóvel que eu vou-te passar a SENSI DO REI AGORA." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = "";
      const systemPrompt = `És a STRANGE AI, uma inteligência artificial agressiva e confiante (estilo hacker gamer). 
      Geras sensibilidades perfeitas de Free Fire. 
      Quando o utilizador enviar o telemóvel, inventa uma sensibilidade técnica e detalhada:
      - Geral, Red Dot, 2x, 4x, Olhadinha.
      - DPI específica.
      - Velocidade do ponteiro e Escala de animação.
      - Dica de puxada (meia lua, puxada reta, etc).
      Mantém o estilo: usa emojis como 🔥, 🎯, 😈 e responde como se fosses o melhor do mundo.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Central ocupada. Tenta de novo, lenda.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Erro na ligação. Mas não desistas do capa!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] animate-in slide-in-from-bottom duration-500">
      <div className="p-4 border-b border-purple-500/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
           <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black italic uppercase">Strange AI</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online / Sensi Ativa</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
              ? 'bg-purple-600 text-white rounded-tr-none shadow-lg' 
              : 'bg-[#0d0d12] border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              {m.text.split('\n').map((line, j) => <p key={j} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[10px] text-purple-500 font-bold uppercase animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> A gerar Sensi...
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/10">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Qual é o teu telemóvel, lenda?"
            className="w-full bg-[#1a1a24] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600"
          />
          <button 
            onClick={sendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-purple-500 hover:text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}