import { useState, useEffect, useCallback, useRef } from 'react';
import { GalleryImage } from '../types';

interface PreloadState {
  loadedThumbs: Set<string>;
  loadedFull: Set<string>;
  loading: Set<string>;
  errors: Set<string>;
}

export const useImagePreloader = (images: GalleryImage[]) => {
  const [state, setState] = useState<PreloadState>({
    loadedThumbs: new Set(),
    loadedFull: new Set(),
    loading: new Set(),
    errors: new Set(),
  });

  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const preloadQueue = useRef<Set<string>>(new Set());

  const loadImage = useCallback((url: string, isFull: boolean = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (imageCache.current.has(url)) {
        resolve();
        return;
      }

      setState(prev => ({
        ...prev,
        loading: new Set(prev.loading).add(url),
      }));

      const img = new Image();

      img.onload = () => {
        imageCache.current.set(url, img);
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading].filter(u => u !== url)),
          loadedThumbs: isFull ? prev.loadedThumbs : new Set(prev.loadedThumbs).add(url),
          loadedFull: isFull ? new Set(prev.loadedFull).add(url) : prev.loadedFull,
        }));
        resolve();
      };

      img.onerror = () => {
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading].filter(u => u !== url)),
          errors: new Set(prev.errors).add(url),
        }));
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }, []);

  const preloadFullImage = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    if (!state.loadedFull.has(image.fullURL) && !state.loading.has(image.fullURL)) {
      loadImage(image.fullURL, true).catch(() => {
        console.warn(`Failed to preload full image: ${image.fullURL}`);
      });
    }
  }, [images, state.loadedFull, state.loading, loadImage]);

  const preloadNearbyImages = useCallback((hoveredId: string) => {
    const hoveredIndex = images.findIndex(img => img.id === hoveredId);
    if (hoveredIndex === -1) return;

    const nearbyIndices = [
      hoveredIndex - 1,
      hoveredIndex + 1,
    ].filter(i => i >= 0 && i < images.length);

    nearbyIndices.forEach(index => {
      const image = images[index];
      if (!preloadQueue.current.has(image.id)) {
        preloadQueue.current.add(image.id);
        setTimeout(() => {
          preloadFullImage(image.id);
          preloadQueue.current.delete(image.id);
        }, 300);
      }
    });
  }, [images, preloadFullImage]);

  useEffect(() => {
    const initialBatch = images.slice(0, 30);

    Promise.all(
      initialBatch.map(img => loadImage(img.thumbURL, false))
    ).catch(() => {
      console.warn('Some thumbnails failed to load');
    });
  }, [images, loadImage]);

  const isThumbLoaded = useCallback((url: string) => {
    return state.loadedThumbs.has(url);
  }, [state.loadedThumbs]);

  const isFullLoaded = useCallback((url: string) => {
    return state.loadedFull.has(url);
  }, [state.loadedFull]);

  const hasError = useCallback((url: string) => {
    return state.errors.has(url);
  }, [state.errors]);

  return {
    isThumbLoaded,
    isFullLoaded,
    hasError,
    preloadFullImage,
    preloadNearbyImages,
  };
};
