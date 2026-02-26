import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import {
    IconBook,
    IconBulb,
    IconChartBar,
    IconPencil,
    IconQuestionMark,
} from '@tabler/icons-react';
import { Editor } from '@tiptap/react';

export const examplePrompts = {
    howTo: [
        'چطور یک باغچه سبزیجات پایدار برای فضاهای کوچک طراحی کنیم؟',
        'چطور برای اولین سفر بین‌المللی آماده شویم؟',
        'چطور یک بودجه شخصی واقعاً کارآمد تنظیم کنیم؟',
        'چطور مهارت سخنرانی عمومی را برای محیط‌های حرفه‌ای بهبود دهیم؟',
    ],

    explainConcepts: [
        'بلاکچین را با زبان ساده توضیح بده.',
        'محاسبات کوانتومی چیست و چه تفاوتی با محاسبات سنتی دارد؟',
        'هوش هیجانی را توضیح بده و اهمیت آن را بیان کن.',
        'فناوری جذب کربن چگونه با تغییرات اقلیمی مبارزه می‌کند؟',
    ],

    creative: [
        'یک داستان کوتاه درباره یک ملاقات تصادفی که زندگی کسی را تغییر می‌دهد بنویس.',
        'یک دستور پخت ترکیبی از غذاهای ایتالیایی و ژاپنی بساز.',
        'یک شهر پایدار خیالی از آینده طراحی کن.',
        'پروفایل شخصیت اصلی یک رمان علمی‌تخیلی را توسعه بده.',
    ],

    advice: [
        'بهترین روش برای مذاکره افزایش حقوق چیست؟',
        'به عنوان یک دونده مبتدی، چطور برای ماراتن آماده شوم؟',
        'چه استراتژی‌هایی به مدیریت تعادل کار و زندگی در دورکاری کمک می‌کند؟',
        'هنگام نگهداری حیوان خانگی برای اولین بار، چه مواردی را باید در نظر بگیرم؟',
    ],

    analysis: [
        'تأثیر بالقوه هوش مصنوعی بر بهداشت و درمان را تحلیل کن.',
        'رویکردهای مختلف برای مقابله با تغییرات اقلیمی را مقایسه کن.',
        'مزایا و معایب منابع مختلف انرژی تجدیدپذیر را بررسی کن.',
        'تأثیر شبکه‌های اجتماعی بر ارتباطات در دهه گذشته را تحلیل کن.',
    ],
};

export const getRandomPrompt = (category?: keyof typeof examplePrompts) => {
    if (category && examplePrompts[category]) {
        const prompts = examplePrompts[category];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    // If no category specified or invalid category, return a random prompt from any category
    const categories = Object.keys(examplePrompts) as Array<keyof typeof examplePrompts>;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const prompts = examplePrompts[randomCategory];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

// Map of category to icon component
const categoryIcons = {
    howTo: { name: 'چطور', icon: IconQuestionMark, color: '!text-yellow-700' },
    explainConcepts: { name: 'توضیح مفاهیم', icon: IconBulb, color: '!text-blue-700' },
    creative: { name: 'خلاقانه', icon: IconPencil, color: '!text-green-700' },
    advice: { name: 'مشاوره', icon: IconBook, color: '!text-purple-700' },
    analysis: { name: 'تحلیل', icon: IconChartBar, color: '!text-red-700' },
};

export const ExamplePrompts = () => {
    const editor: Editor | undefined = useChatStore(state => state.editor);
    const handleCategoryClick = (category: keyof typeof examplePrompts) => {
        console.log('editor', editor);
        if (!editor) return;
        const randomPrompt = getRandomPrompt(category);
        editor.commands.clearContent();
        editor.commands.insertContent(randomPrompt);
    };

    if (!editor) return null;

    return (
        <div className="animate-fade-in mb-8 flex w-full flex-wrap justify-center gap-2 p-6 duration-[1000ms]">
            {Object.entries(categoryIcons).map(([category, value], index) => (
                <Button
                    key={index}
                    variant="bordered"
                    rounded="full"
                    size="sm"
                    onClick={() => handleCategoryClick(category as keyof typeof examplePrompts)}
                >
                    <value.icon size={16} className={'text-muted-foreground/50'} />
                    {value.name}
                </Button>
            ))}
        </div>
    );
};
