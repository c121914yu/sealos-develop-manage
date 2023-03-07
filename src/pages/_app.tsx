import { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/constants/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import { sealosApp, createSealosApp } from 'sealos-desktop-sdk';
import { useConfirm } from '@/hooks/useConfirm';
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
  const { openConfirm, ConfirmChild } = useConfirm({
    title: '跳转提示',
    content: '该应用不允许单独使用，点击确认前往 Sealos Desktop 使用。'
  });
  // useEffect(() => {
  //   NProgress.start();
  //   const response = createSealosApp({
  //     appKey: 'sealos-deploy-manager'
  //   });

  //   (async () => {
  //     try {
  //       const res = await sealosApp.getUserInfo();
  //       localStorage.setItem('session', JSON.stringify(res));
  //       console.log('init app success');
  //     } catch (err) {
  //       console.log('出错了');
  //       openConfirm(() => {
  //         window.open('https://cloud.sealos.io', '_self');
  //       })();
  //     }
  //   })();
  //   NProgress.done();

  //   return response;
  // }, []);

  return (
    <>
      <Head>
        <title>Sealos deploy Manager</title>
        <meta name="description" content="Generated by Sealos Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="/static/iconfont.js" async></Script>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
          <ConfirmChild />
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}
