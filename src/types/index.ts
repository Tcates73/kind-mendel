export interface GalleryImage {
  id: string;
  thumbURL: string;
  fullURL: string;
  title: string;
  tags: string[];
  description: string;
  category: 'Fashion' | 'Sport' | 'Abstract' | 'Urban' | 'Portrait' | 'Nature';
}

export interface ImageData {
  images: GalleryImage[];
}

export interface ImageCardProps {
  image: GalleryImage;
  index: number;
  totalImages: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  activeCategory: string | null;
  reducedMotion: boolean;
}
