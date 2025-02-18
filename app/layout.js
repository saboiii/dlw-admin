import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { dark } from '@clerk/themes'

export const metadata = {
  title: "DLW Admin",
  description: "Main Menu.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body
          className='flex items-center antialiased flex-row'
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
