import type { ComponentProps } from 'react';

export function Grid(props: ComponentProps<'ul'>) {
  return <ul {...props} className='flex flex-row flex-wrap items-start gap-4' />;
}

export function GridItem(props: ComponentProps<'li'>) {
  return (
    <li
      {...props}
      className='w-full min-w-0 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]'
    />
  );
}
