export const useRouter = () => ({
  push: (_path: string) => undefined,
  replace: (_path: string) => undefined,
  refresh: () => undefined,
  back: () => undefined,
  forward: () => undefined,
  prefetch: async () => undefined,
});

export const usePathname = () => '/storybook';
export const useParams = () => ({});
export const useSearchParams = () => new URLSearchParams();
