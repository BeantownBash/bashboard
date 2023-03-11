import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkImages from 'remark-images';
import remarkExtendedTable from 'remark-extended-table';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkEmoji from 'remark-emoji';
import rehypeHighlight from 'rehype-highlight';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';

export default function MarkdownWithPlugins({ content }: { content: string }) {
    return (
        <ReactMarkdown
            className="rendered-markdown"
            remarkPlugins={[
                remarkGfm,
                remarkImages,
                remarkExtendedTable,
                remarkMath,
                remarkEmoji,
                remarkToc,
            ]}
            rehypePlugins={[
                rehypeKatex,
                rehypeHighlight,
                rehypeSlug,
                rehypeAutolinkHeadings,
            ]}
        >
            {content}
        </ReactMarkdown>
    );
}
