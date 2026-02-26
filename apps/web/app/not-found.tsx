import Link from 'next/link';
import { FC } from 'react';

const NotFound: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
        }}
      >
        صفحه پیدا نشد
      </h1>
      <Link
        href="/"
        style={{
          color: '#0070f3',
          textDecoration: 'underline',
        }}
      >
        بازگشت به خانه
      </Link>
    </div>
  );
};

export default NotFound;
