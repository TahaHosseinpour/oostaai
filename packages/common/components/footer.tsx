import Link from 'next/link';

export const Footer = () => {
    const links = [
        {
            href: 'https://git.new/llmchat',
            label: 'ما را در GitHub ستاره دار کنید',
        },
        {
            href: 'https://github.com',
            label: 'تغییرات',
        },
        {
            href: '',
            label: 'بازخورد',
        },
        {
            href: '/terms',
            label: 'شرایط',
        },
        {
            href: '/privacy',
            label: 'حریم خصوصی',
        },
    ];
    return (
        <div className="flex w-full flex-row items-center justify-center gap-4 p-3">
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground text-xs opacity-50 hover:opacity-100"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
