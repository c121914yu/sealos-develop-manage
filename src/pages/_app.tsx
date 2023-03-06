import { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/constants/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import { sealosApp, createSealosApp } from 'sealos-desktop-sdk';
import 'nprogress/nprogress.css';
import '@/styles/reset.scss';

//Binding events.
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0
    }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    NProgress.start();
    const response = createSealosApp({
      appKey: 'sealos-deploy-manager'
    });

    (async () => {
      const res = await sealosApp.getUserInfo();
      localStorage.setItem('session', JSON.stringify(res));
    })();
    NProgress.done();

    return response;
  }, []);

  return (
    <>
      <Head>
        <title>Sealos deploy Manager</title>
        <meta name="description" content="Generated by Sealos Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="/static/iconfont.js" async></script>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}
