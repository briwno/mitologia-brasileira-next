// src/components/Game/DeckPile.js
"use client";

export default function DeckPile({ 
  count = 0, 
  type = "deck", // "deck" ou "discard"
  position = "right" // "right" ou "left"
}) {
  const isDiscard = type === "discard";
  const isLeft = position === "left";
  
  const colors = {
    deck: {
      bg: "bg-blue-900/60",
      border: "border-blue-400",
      text: "text-blue-200",
      badge: "bg-blue-600",
      label: "text-blue-300"
    },
    discard: {
      bg: "bg-gray-800/60",
      border: "border-gray-400", 
      text: "text-gray-200",
      badge: "bg-red-600",
      label: "text-gray-300"
    }
  };

  const currentColors = colors[type];
  const title = isDiscard ? "Descarte" : "Compra";
  const subtitle = isDiscard ? "Desencanto" : "Baralho";

  const containerClasses = isLeft 
    ? "absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center"
    : "flex flex-col items-end gap-2 mt-2 mr-2";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Pilha visual */}
        <div className={`w-12 h-16 ${currentColors.bg} border-2 ${currentColors.border} rounded-lg flex items-center justify-center shadow-lg relative`}>
          <span className={`${currentColors.text} font-bold text-xs text-center leading-tight`}>
            {title}
          </span>
          
          {/* Contador de cartas */}
          {count > 0 && (
            <span className={`absolute -top-2 -right-2 ${currentColors.badge} text-xs rounded-full px-2 py-0.5 text-white font-bold`}>
              {count}
            </span>
          )}
        </div>
        
        {/* Label da pilha */}
        <span className={`text-xs ${currentColors.label} mt-1 text-center`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}
