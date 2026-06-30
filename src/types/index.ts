export type NodeType = 'photo' | 'journal' | 'voice' | 'emotion';

export interface MemoryNode {
  id: string;
  type: NodeType;
  title: string;
  content?: string; // Text for journal entries
  mediaURL?: string; // Image URL or Voice Note URL
  thumbURL?: string; // For photos
  tags: string[];
  emotion?: string; // Primary emotion associated
  date: string;
  connections: string[]; // IDs of connected nodes
}

export interface MemoryData {
  nodes: MemoryNode[];
}

export interface ImageCardProps {
  node: MemoryNode;
  index: number;
  totalNodes: number;
  position: [number, number, number];
  isHovered: boolean;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  reducedMotion: boolean;
  onDrag: (pos: [number, number, number]) => void;
  onDragEnd: () => void;
}

// Deprecated - for backward compatibility during transition
export interface GalleryImage {
  id: string;
  thumbURL: string;
  fullURL: string;
  title: string;
  tags: string[];
  description: string;
  category: string;
}

export interface ImageData {
  images: GalleryImage[];
}
