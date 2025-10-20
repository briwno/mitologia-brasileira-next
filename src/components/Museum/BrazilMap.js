
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";

export default function BrazilMap({ onRegionClick, selectedRegion }) {
  const svgRef = useRef(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const retryTimeoutRef = useRef(null);

  // Mapeamento de estados para regiões (usando useMemo)
  const stateToRegion = useMemo(() => ({
    'BR-AC': 'norte',      // Acre
    'BR-AP': 'norte',      // Amapá  
    'BR-AM': 'norte',      // Amazonas
    'BR-PA': 'norte',      // Pará
    'BR-RO': 'norte',      // Rondônia
    'BR-RR': 'norte',      // Roraima
    'BR-TO': 'norte',      // Tocantins
    'BR-AL': 'nordeste',   // Alagoas
    'BR-BA': 'nordeste',   // Bahia
    'BR-CE': 'nordeste',   // Ceará
    'BR-MA': 'nordeste',   // Maranhão
    'BR-PB': 'nordeste',   // Paraíba
    'BR-PE': 'nordeste',   // Pernambuco
    'BR-PI': 'nordeste',   // Piauí
    'BR-RN': 'nordeste',   // Rio Grande do Norte
    'BR-SE': 'nordeste',   // Sergipe
    'BR-DF': 'centro-oeste', // Distrito Federal
    'BR-GO': 'centro-oeste', // Goiás
    'BR-MT': 'centro-oeste', // Mato Grosso
    'BR-MS': 'centro-oeste', // Mato Grosso do Sul
    'BR-ES': 'sudeste',    // Espírito Santo
    'BR-MG': 'sudeste',    // Minas Gerais
    'BR-RJ': 'sudeste',    // Rio de Janeiro
    'BR-SP': 'sudeste',    // São Paulo
    'BR-PR': 'sul',        // Paraná
    'BR-RS': 'sul',        // Rio Grande do Sul
    'BR-SC': 'sul'         // Santa Catarina
  }), []);

  // Cores das regiões (usando useMemo)
  const regionColors = useMemo(() => ({
    'norte': '#22c55e',
    'nordeste': '#f59e0b', 
    'centro-oeste': '#f97316',
    'sudeste': '#3b82f6',
    'sul': '#8b5cf6'
  }), []);

  // Função para aplicar estilos e event listeners aos paths (usando useCallback)
  const applyStylesToSvg = useCallback((svgDoc) => {
    if (!svgDoc) {
      return false;
    }

    const paths = svgDoc.querySelectorAll('path');
    if (paths.length === 0) {
      return false;
    }

    const getRegionName = (regionId) => {
      const names = {
        'norte': 'Região Norte',
        'nordeste': 'Região Nordeste',
        'centro-oeste': 'Região Centro-Oeste',
        'sudeste': 'Região Sudeste',
        'sul': 'Região Sul'
      };
      return names[regionId] || regionId;
    };
    
    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const region = stateToRegion[stateId];
      
      if (stateId && region) {
        // Estilo baseado na região
        const baseColor = regionColors[region] || '#e5e7eb';
        const isSelected = selectedRegion && selectedRegion.id === region;
        
        // Detectar se é mobile
        const isMobile = window.innerWidth < 640;
        const baseStrokeWidth = isMobile ? '1.2' : '0.8';
        const hoverStrokeWidth = isMobile ? '1.8' : '1.2';
        
        path.style.cursor = 'pointer';
        path.style.fill = isSelected ? baseColor : '#e5e7eb';
        path.style.stroke = '#374151';
        path.style.strokeWidth = baseStrokeWidth;
        path.style.transition = 'all 0.3s ease-in-out';

        // Remover listeners antigos
        const newPath = path.cloneNode(true);
        path.parentNode.replaceChild(newPath, path);

        // Event listeners
        const handleClick = () => {
          if (onRegionClick) {
            const regionData = {
              id: region,
              name: getRegionName(region),
              color: baseColor
            };
            onRegionClick(regionData);
          }
        };

        const handleMouseEnter = () => {
          if (!isSelected) {
            newPath.style.fill = baseColor;
            newPath.style.opacity = '0.8';
          }
          newPath.style.strokeWidth = hoverStrokeWidth;
        };

        const handleMouseLeave = () => {
          newPath.style.fill = isSelected ? baseColor : '#e5e7eb';
          newPath.style.opacity = '1';
          newPath.style.strokeWidth = baseStrokeWidth;
        };

        const handleTouchStart = (e) => {
          e.preventDefault();
          if (!isSelected) {
            newPath.style.fill = baseColor;
            newPath.style.opacity = '0.8';
          }
          newPath.style.strokeWidth = hoverStrokeWidth;
        };

        const handleTouchEnd = (e) => {
          e.preventDefault();
          handleClick();
          setTimeout(() => {
            newPath.style.fill = isSelected ? baseColor : '#e5e7eb';
            newPath.style.opacity = '1';
            newPath.style.strokeWidth = baseStrokeWidth;
          }, 300);
        };

        newPath.addEventListener('click', handleClick);
        newPath.addEventListener('mouseenter', handleMouseEnter);
        newPath.addEventListener('mouseleave', handleMouseLeave);
        newPath.addEventListener('touchstart', handleTouchStart, { passive: false });
        newPath.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
    });

    return true;
  }, [onRegionClick, selectedRegion, regionColors, stateToRegion]);

  useEffect(() => {
    const handleSvgLoad = () => {
      const svgElement = svgRef.current;
      if (!svgElement) {
        return;
      }

      const svgDoc = svgElement.contentDocument;
      
      if (applyStylesToSvg(svgDoc)) {
        setSvgLoaded(true);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      } else {
        // Se falhou, tentar novamente após um delay
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          handleSvgLoad();
        }, 100);
      }
    };

    // Aguardar o SVG carregar
    const svgElement = svgRef.current;
    if (svgElement) {
      // Tentar carregar imediatamente
      if (svgElement.contentDocument) {
        handleSvgLoad();
      }
      
      // Também adicionar listener de load
      svgElement.addEventListener('load', handleSvgLoad);
      
      // Tentar novamente após um delay (fallback)
      const fallbackTimeout = setTimeout(() => {
        if (!svgLoaded) {
          handleSvgLoad();
        }
      }, 500);
      
      return () => {
        svgElement.removeEventListener('load', handleSvgLoad);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        clearTimeout(fallbackTimeout);
      };
    }
  }, [applyStylesToSvg, svgLoaded]);

  // Atualizar cores quando selectedRegion muda
  useEffect(() => {
    if (!svgLoaded) {
      return;
    }

    const svgElement = svgRef.current;
    if (!svgElement?.contentDocument) {
      return;
    }

    const paths = svgElement.contentDocument.querySelectorAll('path');
    const isMobile = window.innerWidth < 640;
    const baseStrokeWidth = isMobile ? '1.2' : '0.8';
    const hoverStrokeWidth = isMobile ? '1.8' : '1.2';

    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const region = stateToRegion[stateId];
      
      if (stateId && region) {
        const baseColor = regionColors[region] || '#e5e7eb';
        const isSelected = selectedRegion && selectedRegion.id === region;
        
        path.style.fill = isSelected ? baseColor : '#e5e7eb';
        path.style.strokeWidth = isSelected ? hoverStrokeWidth : baseStrokeWidth;
      }
    });
  }, [selectedRegion, regionColors, stateToRegion, svgLoaded]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl p-2 sm:p-4 md:p-6 bg-gradient-to-br from-blue-900/20 to-green-900/20 backdrop-blur-sm border border-gray-600/30">
      <div className="relative w-full" style={{ minHeight: "280px", maxHeight: "600px" }}>
        {!svgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Carregando mapa...</p>
            </div>
          </div>
        )}
        <object
          ref={svgRef}
          type="image/svg+xml"
          data="/brazil.svg"
          aria-label="Mapa do Brasil por Regiões"
          className="w-full h-auto mx-auto"
          style={{
            minHeight: "280px",
            maxHeight: "600px",
            maxWidth: "600px",
            display: "block",
            pointerEvents: "auto",
            touchAction: "manipulation",
            opacity: svgLoaded ? 1 : 0.3,
            transition: "opacity 0.3s ease-in-out"
          }}
        >
          Seu navegador não suporta SVG.
        </object>
      </div>
      
      {selectedRegion && (
        <div 
          className="mt-3 sm:mt-4 md:mt-6 text-center bg-black/80 p-3 sm:p-4 rounded-lg border-2 animate-in fade-in-50 duration-300"
          style={{ borderColor: regionColors[selectedRegion.id] || '#e5e7eb' }}
        >
          <h3 
            className="text-base sm:text-lg md:text-xl font-bold mb-2"
            style={{ color: regionColors[selectedRegion.id] || '#ffffff' }}
          >
            {selectedRegion.emoji} {selectedRegion.name}
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base px-2">
            Role para baixo para ver as cartas desta região
          </p>
        </div>
      )}
    </div>
  );
}
