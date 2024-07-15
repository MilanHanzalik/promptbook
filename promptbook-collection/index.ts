export default [
    {
        title: 'Prepare Keywords',
        pipelineUrl: 'https://promptbook.studio/promptbook/prepare-keywords.ptbk.md',
        promptbookVersion: '0.60.0-3',
        parameters: [
            { name: 'content', description: 'The content', isInput: true, isOutput: false },
            { name: 'keywords', description: 'Keywords separated by comma', isInput: false, isOutput: true },
        ],
        promptTemplates: [
            {
                name: 'knowledge',
                title: 'Knowledge',
                dependentParameterNames: ['content'],
                executionType: 'PROMPT_TEMPLATE',
                modelRequirements: { modelVariant: 'CHAT', modelName: 'claude-3-opus-20240229' },
                content:
                    'You are experienced data researcher, detect the important keywords in the document.\n\n# Rules\n\n-   Write just keywords separated by comma\n\n# The document\n\nTake information from this document:\n\n> {content}',
                resultingParameterName: 'keywords',
            },
        ],
        knowledge: [],
    },
    {
        title: 'Prepare Knowledge from Markdown',
        pipelineUrl: 'https://promptbook.studio/promptbook/prepare-knowledge-from-markdown.ptbk.md',
        promptbookVersion: '0.60.0-3',
        parameters: [
            { name: 'content', description: 'Markdown document content', isInput: true, isOutput: false },
            { name: 'knowledge', description: 'The knowledge JSON object', isInput: false, isOutput: true },
        ],
        promptTemplates: [
            {
                name: 'knowledge',
                title: 'Knowledge',
                dependentParameterNames: ['content'],
                executionType: 'PROMPT_TEMPLATE',
                modelRequirements: { modelVariant: 'CHAT', modelName: 'claude-3-opus-20240229' },
                content:
                    'You are experienced data researcher, extract the important knowledge from the document.\n\n# Rules\n\n-   Make pieces of information concise, clear, and easy to understand\n-   One piece of information should be approximately 1 paragraph\n-   Divide the paragraphs by markdown horizontal lines ---\n-   Omit irrelevant information\n-   Group redundant information\n-   Write just extracted information, nothing else\n\n# The document\n\nTake information from this document:\n\n> {content}',
                resultingParameterName: 'knowledge',
            },
        ],
        knowledge: [],
    },
];
