import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import ui from "@nuxt/ui/vite";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ui({
      ui: {
        select: {
          slots: {
            base: "min-h-9 w-full rounded-lg border border-amber-500/35 bg-white px-2.5 py-1.5 text-sm text-amber-900 shadow-none transition-colors hover:border-amber-500/55 focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500/30 data-[state=open]:border-amber-500 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:hover:border-amber-300/45 dark:focus-visible:border-amber-300 dark:focus-visible:ring-amber-300/25 dark:data-[state=open]:border-amber-300",
            trailingIcon: "text-amber-800/70 dark:text-amber-100/70",
            value: "text-amber-900/90 dark:text-amber-100/90",
            placeholder: "text-amber-900/60 dark:text-amber-100/60",
            content: "rounded-xl border border-amber-500/25 bg-amber-50 p-1 shadow-lg shadow-amber-900/10 dark:border-amber-300/20 dark:bg-zinc-900 dark:shadow-black/35",
            item: "rounded-lg text-amber-900/90 hover:bg-amber-100 dark:text-amber-100/90 dark:hover:bg-zinc-800 data-highlighted:not-data-disabled:bg-amber-100 dark:data-highlighted:not-data-disabled:bg-zinc-800",
          },
          defaultVariants: {
            color: "neutral",
            variant: "ghost",
          },
        },
        fileUpload: {
          slots: {
            base: "min-h-16 w-full rounded-lg border border-amber-500/40 bg-white px-2.5 py-2 text-sm text-amber-900 shadow-none transition-colors hover:bg-amber-100/60 hover:border-amber-500/55 focus-visible:ring-1 focus-visible:ring-amber-500/30 dark:border-amber-300/25 dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700 dark:hover:border-amber-300/45 dark:focus-visible:ring-amber-300/25",
            avatar: "bg-amber-100 text-amber-700 ring-1 ring-amber-500/25 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-300/25 [&_svg]:text-amber-700 dark:[&_svg]:text-amber-200",
            icon: "text-amber-700 dark:text-amber-300",
          },
          defaultVariants: {
            color: "neutral",
            variant: "outline",
          },
        },
      },
    }),
  ],
  // Update this if you change the GitHub repository name.
  base: "/let-me-cook/",
});
