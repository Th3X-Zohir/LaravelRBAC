import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { ThemeProvider } from '@/components/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider defaultTheme="system" storageKey="room-ui-theme">
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: 'oklch(0.491 0.27 292.581)',
        delay: 250,
        includeCSS: true,
        showSpinner: false,
    },
});
