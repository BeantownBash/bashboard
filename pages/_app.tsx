import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '@/components/Header';
import { Inter, Epilogue, Roboto_Mono } from '@next/font/google';
import './globals.css';
import './markdownstyles.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const epilogue = Epilogue({ subsets: ['latin'], variable: '--font-epilogue' });
const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-roboto-mono',
});

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <Head>
                <title>Bashboard | Beantown Bash</title>
                <meta
                    content="width=device-width, initial-scale=1"
                    name="viewport"
                />
                <meta
                    name="description"
                    content="Projects dashboard for the Beantown Bash hackathon. Create. Connect. Kaboom!"
                />

                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png?v=1"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png?v=1"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png?v=1"
                />
                <link rel="manifest" href="/site.webmanifest?v=1" />
                <link
                    rel="mask-icon"
                    href="/safari-pinned-tab.svg?v=1"
                    color="#00919e"
                />
                <link rel="shortcut icon" href="/favicon.ico?v=1" />
                <meta name="msapplication-TileColor" content="#00919e" />
                <meta name="theme-color" content="#00919e" />
            </Head>
            <SessionProvider session={pageProps.session}>
                <div
                    className={`${inter.variable} ${epilogue.variable} ${robotoMono.variable} font-sans`}
                >
                    <Header />
                    <Component {...pageProps} />
                </div>
            </SessionProvider>
        </>
    );
};

export default App;
