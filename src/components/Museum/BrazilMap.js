
import React, { useEffect, useRef, useMemo } from "react";

export default function BrazilMap({ onRegionClick, selectedRegion }) {
  const svgRef = useRef(null);

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

  useEffect(() => {
    const handleSvgLoad = () => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const svgDoc = svgElement.contentDocument;
      if (!svgDoc) return;

      // Adicionar event listeners para todos os paths (estados)
      const paths = svgDoc.querySelectorAll('path');
      
      paths.forEach(path => {
        const stateId = path.getAttribute('id');
        const region = stateToRegion[stateId];
        
        if (stateId && region) {
          // Estilo baseado na região
          const baseColor = regionColors[region] || '#e5e7eb';
          const isSelected = selectedRegion && selectedRegion.id === region;
          
          path.style.cursor = 'pointer';
          path.style.fill = isSelected ? baseColor : '#e5e7eb';
          path.style.stroke = '#374151';
          path.style.strokeWidth = '0.8';
          path.style.transition = 'all 0.3s ease-in-out';

          // Event listeners
          path.addEventListener('click', () => {
            if (onRegionClick) {
              const regionData = {
                id: region,
                name: getRegionName(region),
                color: baseColor
              };
              onRegionClick(regionData);
            }
          });

          path.addEventListener('mouseenter', () => {
            if (!isSelected) {
              path.style.fill = baseColor;
              path.style.opacity = '0.8';
            }
            path.style.strokeWidth = '1.2';
          });

          path.addEventListener('mouseleave', () => {
            path.style.fill = isSelected ? baseColor : '#e5e7eb';
            path.style.opacity = '1';
            path.style.strokeWidth = '0.8';
          });
        }
      });
    };

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

    // Aguardar o SVG carregar
    const svgElement = svgRef.current;
    if (svgElement) {
      if (svgElement.contentDocument) {
        handleSvgLoad();
      } else {
        svgElement.addEventListener('load', handleSvgLoad);
        return () => svgElement.removeEventListener('load', handleSvgLoad);
      }
    }
  }, [onRegionClick, selectedRegion, regionColors, stateToRegion]);

  // Atualizar cores quando selectedRegion muda
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement?.contentDocument) return;

    const paths = svgElement.contentDocument.querySelectorAll('path');
    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const region = stateToRegion[stateId];
      
      if (stateId && region) {
        const baseColor = regionColors[region] || '#e5e7eb';
        const isSelected = selectedRegion && selectedRegion.id === region;
        path.style.fill = isSelected ? baseColor : '#e5e7eb';
      }
    });
  }, [selectedRegion, regionColors, stateToRegion]);

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "800px", 
      margin: "0 auto",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}>
      <object
        ref={svgRef}
        type="image/svg+xml"
        data="/brazil.svg"
        aria-label="Mapa do Brasil por Regiões"
        style={{ 
          width: "100%", 
          height: "auto",
          minHeight: "400px"
        }}
      >
        Seu navegador não suporta SVG.
      </object>
      
      {selectedRegion && (
        <div style={{ 
          marginTop: "20px", 
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.8)",
          padding: "15px",
          borderRadius: "8px",
          border: `2px solid ${regionColors[selectedRegion.id] || '#e5e7eb'}`
        }}>
          <h3 style={{ 
            color: regionColors[selectedRegion.id] || '#ffffff', 
            fontSize: "18px", 
            fontWeight: "bold",
            margin: "0 0 10px 0"
          }}>
            {selectedRegion.emoji} {selectedRegion.name}
          </h3>
          <p style={{ color: "#d1d5db", fontSize: "14px", margin: "0" }}>
            Clique nos cards abaixo para ver as cartas desta região
          </p>
        </div>
      )}
    </div>
  );
}
