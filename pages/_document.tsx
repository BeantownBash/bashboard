import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html className="bg-zinc-900">
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.css"
                    integrity="sha384-ko6T2DjISesD0S+wOIeHKMyKsHvWpdQ1s/aiaQMbL+TIXx3jg6uyf9hlv3WWfwYv"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/styles/base16/gruvbox-dark-hard.min.css"
                    integrity="sha512-kCMzrI8UyzNgyq0JVxwb17xy9nRVhwyPBSTaRC1hiOCnbMKBv9vII61ZHD4EmHpc+o0o9trcRCRAk6j5vVft8A=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </Head>
            <body className="text-lg text-white">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
