import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Save, Trash, ZoomIn, ZoomOut, Move, Share, Grid, List, PanelLeft, Palette, Home, Pencil } from 'lucide-react';
import { useIsMobile } from "../hooks/use-mobile";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/firebase-db';
import { deleteMindMap, updateMindMap } from '@/integrations/firebase/firebase-db';

interface MindMapNode {
  id: number;
  title: string;
  x: number;
  y: number;
  parentId: number | null;
  color?: string;
}

// Componente principal do mapa mental
const MindMapSystem = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapTitle, setMapTitle] = useState(localStorage.getItem('mapTitle') || 'Mapa Mental do Projeto');
  const mapContainerRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const nextNodeId = useRef(2);
  const [mindMaps, setMindMaps] = useState([]);
  const [nodes, setNodes] = useState<MindMapNode[]>([
    { id: 1, title: 'Projeto Principal', x: isMobile ? 300 : 500, y: isMobile ? 500 : 900, parentId: null }
  ]);
  const [connections, setConnections] = useState([]);
  const [editingMapId, setEditingMapId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);

  const fetchMindMaps = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      console.log('userId:', userId);
      const mindMapCollection = collection(db, 'mapamind');
      const q = query(mindMapCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      console.log('querySnapshot:', querySnapshot);
      const mindMapsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('mindMapsData:', mindMapsData);
      setMindMaps(mindMapsData);
    }
  };

  useEffect(() => {
    fetchMindMaps();
  }, []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(isMobile ? 0.7 : 1);
  const [isDragging, setIsDragging] = useState(false);
  const [isMoveButtonActive, setIsMoveButtonActive] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('mind-map'); // 'mind-map', 'logical', 'grid'
  const [availableColors, setAvailableColors] = useState(['#4F46E5', '#818CF8', '#6EE7B7', '#FBBF24', '#EF4444']);

  // Função para abrir o mapa mental em tela completa
  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  // Função para fechar o mapa mental
  const closeFullScreen = () => {
    setIsFullScreen(false);
    setEditingMapId(null);
  };

  // Adicionar um novo nó filho
  const addChildNode = (parentId) => {
    const parentNode = nodes.find(node => node.id === parentId);
    if (!parentNode) return;

    // Calcula posição do novo nó baseado na quantidade de filhos existentes
    const childrenCount = nodes.filter(node => node.parentId === parentId).length;
    const angle = (childrenCount * Math.PI / 4) - Math.PI / 2;
    const distance = 150;

    let color;
    if (parentId === 1) {
      // Escolhe uma cor aleatória do array de cores disponíveis
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      color = availableColors[randomIndex];
    } else {
      color = parentNode.color;
    }
    let newX = 800;
    let newY = isMobile ? 700 : 900;
    if (parentId !== 1) {
      newX = parentNode.x + 300;
      newY = parentNode.y;
    }

    const newNode = {
      id: nextNodeId.current,
      title: 'Novo Item',
      x: newX,
      y: newY,
      parentId: parentId,
      color: color
    };

    const newConnection = {
      id: `${parentId}-${nextNodeId.current}`,
      sourceId: parentId,
      targetId: nextNodeId.current
    };

    nextNodeId.current += 1;
    setNodes([...nodes, newNode]);
    setConnections([...connections, newConnection]);
  };

  // Atualizar o título de um nó
  const updateNodeTitle = (nodeId, newTitle) => {
    console.log('updateNodeTitle chamado com nodeId:', nodeId, 'e newTitle:', newTitle);
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, title: newTitle } : node
    ));
  };

  // Remover um nó e seus filhos recursivamente
  const removeNode = (nodeId) => {
    // Encontra todos os nós filhos recursivamente
    const findAllChildren = (id) => {
      const children = nodes.filter(node => node.parentId === id).map(node => node.id);
      let allChildren = [...children];
      
      children.forEach(childId => {
        allChildren = [...allChildren, ...findAllChildren(childId)];
      });
      
      return allChildren;
    };
    
    const childrenIds = findAllChildren(nodeId);
    const allNodesToRemove = [nodeId, ...childrenIds];
    
    // Remove nós
    setNodes(nodes.filter(node => !allNodesToRemove.includes(node.id)));
    
    // Remove conexões
    setConnections(connections.filter(conn => 
      !allNodesToRemove.includes(conn.sourceId) && !allNodesToRemove.includes(conn.targetId)
    ));
  };

  // Funções para lidar com arrastar nós
  const startDragNode = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode({
        ...node,
        startX: e.clientX,
        startY: e.clientY
      });
    }
  };

  const onDragNode = useCallback((e) => {
    if (selectedNode) {
      const dx = (e.clientX - selectedNode.startX) / zoom;
      const dy = (e.clientY - selectedNode.startY) / zoom;

      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === selectedNode.id
            ? { ...node, x: selectedNode.x + dx, y: selectedNode.y + dy }
            : node
        )
      );

      setSelectedNode(prevSelectedNode => ({
        ...prevSelectedNode,
        startX: e.clientX,
        startY: e.clientY,
        x: selectedNode.x + dx,
        y: selectedNode.y + dy
      }));
    }
  }, [selectedNode, zoom, setNodes, setSelectedNode]);

  const stopDragNode = () => {
    setSelectedNode(null);
  };

  // Funções para mover todo o mapa
  const startDragView = (e) => {
    e.preventDefault();
    if (!selectedNode) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - viewPosition.x,
        y: e.clientY - viewPosition.y
      });
    }
  };

  const onDragView = (e) => {
    if (isDragging) {
      setViewPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const stopDragView = () => {
    setIsDragging(false);
  };

  // Funções de zoom
  const zoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  const zoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  // Mudar modo de visualização
  const changeViewMode = (mode) => {
    setViewMode(mode);
  };

  // Salvar o mapa
  const saveMap = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const mapData = {
        nodes,
        connections,
        nextNodeId: nextNodeId.current
      };

      // Salva o mapa mental no Firebase
      try {
        const { addMindMap } = await import('@/integrations/firebase/firebase-db');
        console.log('addMindMap:', addMindMap);
        await addMindMap(mapData, userId);
        localStorage.setItem('mindMap', JSON.stringify(mapData));
        alert('Mapa salvo com sucesso no Firebase!');
        // Atualiza a lista de mapas mentais
        fetchMindMaps();
      } catch (error) {
        console.error('Erro ao salvar o mapa mental no Firebase:', error);
        alert('Erro ao salvar o mapa mental no Firebase!');
      }
    } else {
      alert('Usuário não autenticado!');
    }
  };

  // Funções para compartilhar
  const shareMap = () => {
    alert('Funcionalidade de compartilhamento em desenvolvimento!');
  };

  // Navegar para outros mapas
  const navigateToMaps = () => {
    alert('Funcionalidade de navegação para outros mapas em desenvolvimento!');
  };

  // Mudar o estilo
  const changeStyle = () => {
    alert('Funcionalidade de alteração de estilo em desenvolvimento!');
  };

  // Efeitos para gerenciar eventos de arrastar
  useEffect(() => {
    if (selectedNode) {
      document.addEventListener('mousemove', onDragNode);
      document.addEventListener('mouseup', stopDragNode);
      return () => {
        document.removeEventListener('mousemove', onDragNode);
        document.removeEventListener('mouseup', stopDragNode);
      };
    }
  }, [selectedNode]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDragView);
      document.addEventListener('mouseup', stopDragView);
      return () => {
        document.removeEventListener('mousemove', onDragView);
        document.removeEventListener('mouseup', stopDragView);
      };
    }
  }, [isDragging]);

  // Renderização baseada no modo de visualização
  const renderNodesAndConnections = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid gap-4 p-4 grid-cols-3">
          {nodes.map(node => (
            <div 
              key={node.id}
              className="bg-white rounded-lg shadow-lg p-3"
            >
              <input 
                className="text-sm font-medium text-center border-b border-gray-200 focus:outline-none focus:border-indigo-500 w-full"
                value={node.title}
                onChange={(e) => updateNodeTitle(node.id, e.target.value)}
              />
              <div className="flex justify-center mt-2 space-x-2">
                <button 
                  className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
                  onClick={() => addChildNode(node.id)}
                >
                  <Plus size={16} />
                </button>
                {node.parentId !== null && (
                  <button 
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    onClick={() => removeNode(node.id)}
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
              {node.parentId && (
                <div className="text-xs text-gray-500 mt-2">
                  Relacionado a: {nodes.find(n => n.id === node.parentId)?.title}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else if (viewMode === 'logical') {
      // Estrutura os nós em um diagrama lógico hierárquico
      const buildHierarchy = (parentId = null, level = 0) => {
        const children = nodes.filter(node => node.parentId === parentId);
        
        return (
          <div className="flex flex-col items-start ml-8">
            {children.map(node => (
              <div key={node.id} className="my-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  <div 
                    className="bg-white rounded-lg shadow-lg p-3 min-w-40"
                  >
                    <input 
                      className="text-sm font-medium border-b border-gray-200 focus:outline-none focus:border-indigo-500 w-full"
                      value={node.title}
                      onChange={(e) => updateNodeTitle(node.id, e.target.value)}
                    />
                    <div className="flex mt-2 space-x-2">
                      <button 
                        className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
                        onClick={() => addChildNode(node.id)}
                      >
                        <Plus size={16} />
                      </button>
                      {node.parentId !== null && (
                        <button 
                          className="p-1 rounded-full hover:bg-red-100 text-red-600"
                          onClick={() => removeNode(node.id)}
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {buildHierarchy(node.id, level + 1)}
              </div>
            ))}
          </div>
        );
      };
      
      const rootNode = nodes.find(node => node.parentId === null);
      
      return (
        <div className="p-8 overflow-auto">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
            <div 
              className="bg-white rounded-lg shadow-lg p-4 min-w-48"
            >
              <input 
                className="text-lg font-bold border-b border-gray-200 focus:outline-none focus:border-indigo-500 w-full"
                value={rootNode?.title || 'Projeto Principal'}
                onChange={(e) => updateNodeTitle(rootNode?.id, e.target.value)}
              />
              <div className="flex mt-2 space-x-2">
                <button 
                  className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
                  onClick={() => addChildNode(rootNode?.id)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ overflow: 'auto' }}>
            {buildHierarchy(rootNode?.id)}
          </div>
        </div>
      );
    } else {
      // Modo padrão: mind-map
      return (
        <>
          {/* Renderiza os nós */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute rounded-lg shadow-lg p-3 cursor-move"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: node.color || 'white'
              }}
              onMouseDown={(e) => startDragNode(e, node.id)}
            >
              <textarea
                className="text-xs font-medium text-center border-b border-gray-200 focus:outline-none focus:border-indigo-500 rounded-lg shadow-lg p-3 cursor-move"
                style={{ wordWrap: 'break-word', whiteSpace: 'normal', minHeight: '16px', fontSize: '0.8rem', resize: 'vertical', backgroundColor: node.color || 'white', width: 'auto', height: 'auto' }}
                value={node.title}
                onChange={(e) => {
                  updateNodeTitle(node.id, e.target.value);
                  requestAnimationFrame(() => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  });
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-center mt-2 space-x-2">
                <button
                  className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    addChildNode(node.id);
                  }}
                  title="Adicionar item filho"
                >
                  <Plus size={12} />
                </button>
                {node.parentId !== null && (
                  <button 
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    title="Remover este item"
                  >
                    <Trash size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Renderiza as conexões */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-2500 -2500 5000 5000">
            {connections.map(conn => {
              const source = nodes.find(node => node.id === conn.sourceId);
              const target = nodes.find(node => node.id === conn.targetId);
              if (!source || !target) return null;

              // Calcula o ponto central dos nós de origem e destino
              const sourceX = source.x + 60;
              const sourceY = source.y + 20;
              const targetX = target.x + 60;
              const targetY = target.y + 20;

              return (
                <line
                  key={conn.id}
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={target.y + 20}
                  stroke={target.color || '#6366F1'}
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
        </>
      );
    }
  };

  // Componente Card que será clicado para abrir o mapa mental
  const MindMapCard = () => {
    console.log('MindMapCard renderizado');
    return (
      <div 
        className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => {
          if (!editingMapId) {
            openFullScreen();
          }
        }}
      >
        <h1 className="text-lg font-semibold mb-2">{mapTitle}</h1>
        <p className="text-gray-600">Clique para abrir o editor de mapa mental</p>
        <div className="mt-4 flex justify-center">
          <svg width="100" height="60" viewBox="0 0 100 60">
            <circle cx="50" cy="30" r="10" fill="#4F46E5" />
            <circle cx="20" cy="15" r="6" fill="#818CF8" />
            <circle cx="80" cy="15" r="6" fill="#818CF8" />
            <circle cx="30" cy="50" r="6" fill="#818CF8" />
            <circle cx="70" cy="50" r="6" fill="#818CF8" />
            <line x1="50" y1="30" x2="20" y2="15" stroke="#818CF8" strokeWidth="2" />
            <line x1="50" y1="30" x2="80" y2="15" stroke="#818CF8" strokeWidth="2" />
            <line x1="50" y1="30" x2="30" y2="50" stroke="#818CF8" strokeWidth="2" />
            <line x1="50" y1="30" x2="70" y2="50" strokeWidth="2" />
          </svg>
        </div>
        {mindMaps.length > 0 ? (
          <ul>
            {mindMaps.map(map => (
              <li key={map.id} className="flex items-center justify-between">
                {editingMapId === map.id ? (
                  <input
                    type="text"
                    key={map.id}
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:border-b-2 focus:border-indigo-500"
                    value={editingTitle}
                    onChange={(e) => {
                      console.log('editingTitle:', e.target.value);
                      setEditingTitle(e.target.value);
                    }}
                    onBlur={async () => {
                      try {
                        console.log('editingTitle onBlur:', editingTitle);
                        await updateMindMap(map.id, { title: editingTitle });
                        setEditingMapId(null);
                        fetchMindMaps();
                      } catch (error) {
                        console.error('Erro ao atualizar o mapa mental:', error);
                        alert('Erro ao atualizar o mapa mental!');
                      }
                    }}
                    ref={editInputRef}
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingMapId(map.id);
                      setEditingTitle(map.title);
                      // Focus on the input after setting editingMapId
                      setTimeout(() => {
                        editInputRef.current && (editInputRef.current as HTMLInputElement).focus();
                      }, 0);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {map.title || 'Sem título'}
                  </span>
                )}
                <div className="flex items-center">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMapId(map.id);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteMindMap(map.id);
                        fetchMindMaps();
                      } catch (error) {
                        console.error('Erro ao excluir o mapa mental:', error);
                        alert('Erro ao excluir o mapa mental!');
                      }
                    }}
                  >
                    <Trash size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum mapa mental salvo.</p>
        )}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => {
            navigate('/');
          }}
          title="Voltar"
          style={{ zIndex: 10 }}
        >
          Voltar
        </button>
      </div>
    );
  };

  // Renderiza o sistema de mapa mental
  return (
    <div className="mind-map-system">
      {!isFullScreen ? (
        <MindMapCard />
      ) : (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden">
          {/* Barra de ferramentas */}
          <div className={`bg-gray-100 p-2 shadow-md flex flex-col justify-between ${isMobile ? 'mobile-toolbar' : ''}`} style={{ minHeight: '100vh' }}>
            {/* Título */}
            {editingMapId ? (
              <input
                type="text"
                className="text-xl font-bold text-center bg-transparent border-none focus:outline-none focus:border-b-2 focus:border-indigo-500"
                value={editingTitle}
                onChange={(e) => {
                  console.log('editingTitle:', e.target.value);
                  setEditingTitle(e.target.value);
                }}
                onBlur={async () => {
                  try {
                    console.log('editingTitle onBlur:', editingTitle);
                    await updateMindMap(editingMapId, { title: editingTitle });
                    setMapTitle(editingTitle);
                    setEditingMapId(null);
                    fetchMindMaps();
                  } catch (error) {
                    console.error('Erro ao atualizar o mapa mental:', error);
                    alert('Erro ao atualizar o mapa mental!');
                  }
                }}
              />
            ) : (
              <h1 className="text-xl font-bold text-center">{mapTitle}</h1>
            )}

            {/* Área de botões */}
            <div className="flex items-center space-x-2 flex-wrap justify-center" style={{ marginTop: 'auto' }}>
              {/* Ferramentas de visualização */}
              <button
                className={`p-2 rounded ${viewMode === 'mind-map' ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  console.log('changeViewMode(mind-map) clicked');
                  changeViewMode('mind-map');
                }}
                title="Visualização Mapa Mental"
                style={{ zIndex: 10 }}
              >
                <PanelLeft size={20} />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'logical' ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  console.log('changeViewMode(logical) clicked');
                  changeViewMode('logical');
                }}
                title="Visualização Lógica"
                style={{ zIndex: 10 }}
              >
                <List size={20} />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  console.log('changeViewMode(grid) clicked');
                  changeViewMode('grid');
                }}
                title="Visualização em Grade"
                style={{ zIndex: 10 }}
              >
                <Grid size={20} />
              </button>

              {/* Ferramentas de navegação */}
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('zoomIn clicked');
                  zoomIn();
                }}
                title="Aumentar Zoom"
                style={{ zIndex: 10 }}
              >
                <ZoomIn size={20} />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('zoomOut clicked');
                  zoomOut();
                }}
                title="Diminuir Zoom"
                style={{ zIndex: 10 }}
              >
                <ZoomOut size={20} />
              </button>
              <button
                className={`p-2 rounded ${isMoveButtonActive ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  console.log('moveMap clicked');
                  setIsMoveButtonActive(!isMoveButtonActive);
                  setIsDragging(!isDragging);
                }}
                style={{ zIndex: 10 }}
              >
                <Move size={20} />
              </button>

              {/* Ferramentas adicionais */}
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('shareMap clicked');
                  shareMap();
                }}
                title="Compartilhar Mapa"
                style={{ zIndex: 10 }}
              >
                <Share size={20} />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('changeStyle clicked');
                  changeStyle();
                }}
                title="Alterar Estilo"
                style={{ zIndex: 10 }}
              >
                <Palette size={20} />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('navigateToMaps clicked');
                  navigateToMaps();
                }}
                title="Navegar para Outros Mapas"
                style={{ zIndex: 10 }}
              >
                <Home size={20} />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('saveMap clicked');
                  saveMap();
                }}
                title="Salvar Mapa"
                style={{ zIndex: 10 }}
              >
                <Save size={20} />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => {
                  console.log('closeFullScreen clicked');
                  closeFullScreen();
                }}
                title="Fechar"
                style={{ zIndex: 10 }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Área do mapa mental */}
          <div 
            className="h-full w-full bg-gray-50 overflow-visible"
            onMouseDown={isMoveButtonActive ? startDragView : null}
            onTouchStart={isMoveButtonActive ? startDragView : null}
            ref={mapContainerRef}
          >
            {viewMode === 'mind-map' ? (
              <div 
                className="transform origin-center transition-transform duration-100"
                style={{
                  transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${zoom})`,
                  position: 'relative',
                  width: '5000px',
                  height: '5000px',
                }}
              >
                {/* Grade de fundo para indicar espaço infinito */}
                <div
                  className="absolute"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    width: '10000px',
                    height: '10000px',
                    left: '-5000px',
                    top: '-5000px',
                  }}
                ></div>

                {/* Renderiza as conexões */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-2500 -2500 5000 5000">
                  {useMemo(() => connections.map(conn => {
                    const source = nodes.find(node => node.id === conn.sourceId);
                    const target = nodes.find(node => node.id === conn.targetId);
                    if (!source || !target) return null;

                    const sourceX = Number(source.x) + 60;
                    const sourceY = Number(source.y) + 20;
                    const targetX = Number(target.x) + 60;
                    const targetY = Number(target.y) + 20;

                    if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
                      console.error("Coordenadas inválidas para a conexão:", conn);
                      return null;
                    }

                    interface LineProps {
                      x1: number;
                      y1: number;
                      x2: number;
                      y2: number;
                      stroke: string;
                    }

                    const Line = React.memo(function Line({ x1, y1, x2, y2, stroke }: LineProps) {
                      return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2} />;
                    });

                    return (
                      <Line
                        key={conn.id}
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        stroke={target.color || '#6366F1'}
                      />
                    );
                  }), [connections, nodes])}
                </svg>

                {renderNodesAndConnections()}
              </div>
            ) : (
              <div className="h-full overflow-auto">
                {renderNodesAndConnections()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapSystem;
