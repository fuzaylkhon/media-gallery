import { useEffect, useRef } from 'react';

export function useInfiniteScroll({ enabled, onLoadMore }: { enabled: boolean; onLoadMore: () => void }) {
  const intersectionElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = intersectionElRef.current;
    if (!enabled || !element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        onLoadMore();
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return intersectionElRef;
}
