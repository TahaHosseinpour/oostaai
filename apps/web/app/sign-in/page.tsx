import { redirect } from 'next/navigation';

// Auth removed — no sign-in page; send users straight to the app.
export default function Page() {
    redirect('/chat');
}
